import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { qr_code, requester_name, description, priority } = body

    if (!qr_code || !requester_name?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: qr_code, requester_name, description' },
        { status: 400 }
      )
    }

    const validPriorities = ['low', 'medium', 'high']
    const safePriority = validPriorities.includes(priority) ? priority : 'medium'

    const supabase = createAdminClient()

    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('id, company_id, tag, name')
      .eq('qr_code', qr_code)
      .eq('status', 'active')
      .single()

    if (assetError || !asset) {
      return NextResponse.json(
        { error: 'Ativo não encontrado ou inativo.' },
        { status: 404 }
      )
    }

    const { data: wo, error: woError } = await supabase
      .from('work_orders')
      .insert({
        company_id: asset.company_id,
        asset_id: asset.id,
        os_type: 'corrective',
        status: 'open',
        priority: safePriority,
        title: `Chamado externo — ${asset.tag}`,
        failure_description: description.trim(),
        requested_by: requester_name.trim(),
        scheduled_date: new Date().toISOString().split('T')[0],
      })
      .select('wo_number')
      .single()

    if (woError) {
      console.error('Error creating public WO:', woError)
      return NextResponse.json(
        { error: 'Erro ao criar solicitação. Tente novamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      wo_number: wo.wo_number,
      asset_tag: asset.tag,
      asset_name: asset.name,
    })
  } catch (err) {
    console.error('Public request error:', err)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
