-- ============================================================
-- PCM FORGE — SEED DE TEMPLATES GLOBAIS
-- ============================================================

-- Nota: Assumindo que existe ao menos uma empresa cadastrada.
-- Caso queira associar a uma empresa específica, substitua (SELECT id FROM companies LIMIT 1) pelo UUID da empresa.

DO $$
DECLARE
    v_company_id UUID;
    v_template_id UUID;
BEGIN
    SELECT id INTO v_company_id FROM companies LIMIT 1;
    
    IF v_company_id IS NULL THEN
        RAISE NOTICE 'Nenhuma empresa encontrada. Crie uma empresa antes de rodar este seed.';
        RETURN;
    END IF;

    -- 1. Inspeção Geral - Equipamento Rotativo
    INSERT INTO checklist_templates (company_id, name, description, category, is_global)
    VALUES (v_company_id, 'Inspeção Geral - Equipamento Rotativo', 'Checklist padrão para motores, bombas e ventiladores.', 'Geral', true)
    RETURNING id INTO v_template_id;

    INSERT INTO checklist_template_items (template_id, sort_order, group_name, description, item_type, min_value, max_value, unit, requires_photo)
    VALUES 
        (v_template_id, 1, 'Parte Mecânica', 'Verificar vibração (Nível Global)', 'measure', 0, 4.5, 'mm/s', false),
        (v_template_id, 2, 'Parte Mecânica', 'Verificar temperatura de mancal', 'measure', 0, 80, '°C', false),
        (v_template_id, 3, 'Parte Mecânica', 'Estado físico dos rolamentos (ruído/aquecimento)', 'check', null, null, null, false),
        (v_template_id, 4, 'Parte Mecânica', 'Alinhamento visual de eixos', 'check', null, null, null, false),
        (v_template_id, 5, 'Parte Mecânica', 'Lubrificação (nível e condição)', 'check', null, null, null, false),
        (v_template_id, 6, 'Parte Mecânica', 'Estado de correias ou acoplamento', 'check', null, null, null, false),
        (v_template_id, 7, 'Parte Elétrica', 'Integridade e fixação de cabos/conduítes', 'check', null, null, null, false),
        (v_template_id, 8, 'Parte Elétrica', 'Leitura de corrente nominal', 'measure', null, null, 'A', false),
        (v_template_id, 9, 'Parte Elétrica', 'Verificar continuidade de aterramento', 'check', null, null, null, false),
        (v_template_id, 10, 'Parte Elétrica', 'Limpeza interna e estado do painel/bornes', 'check', null, null, null, false),
        (v_template_id, 11, 'Parte Elétrica', 'Temperatura da carcaça do motor', 'measure', 0, 90, '°C', false),
        (v_template_id, 12, 'Segurança', 'Proteções mecânicas contra contato instaladas', 'check', null, null, null, true),
        (v_template_id, 13, 'Segurança', 'Sinalização de segurança visível e adequada', 'check', null, null, null, false),
        (v_template_id, 14, 'Segurança', 'Extintor acessível e carregado na área', 'check', null, null, null, false),
        (v_template_id, 15, 'Segurança', 'Foto panorâmica do conjunto instalado', 'photo', null, null, null, false);

    -- 2. Preventiva - Compressor de Ar
    INSERT INTO checklist_templates (company_id, name, description, category, is_global)
    VALUES (v_company_id, 'Preventiva - Compressor de Ar', 'Manutenção preventiva periódica para compressores de pistão ou parafuso.', 'Preventiva', true)
    RETURNING id INTO v_template_id;

    INSERT INTO checklist_template_items (template_id, sort_order, group_name, description, item_type, min_value, max_value, unit, requires_photo, options)
    VALUES 
        (v_template_id, 1, 'Sistema Pneumático', 'Pressão de descarga (trabalho)', 'measure', 6, 10, 'bar', false, null),
        (v_template_id, 2, 'Sistema Pneumático', 'Condição do elemento do filtro de ar', 'select', null, null, null, false, 'Bom|Regular|Trocar'),
        (v_template_id, 3, 'Sistema Pneumático', 'Verificar vazamentos em conexões e mangueiras', 'check', null, null, null, false, null),
        (v_template_id, 4, 'Sistema Pneumático', 'Proceder com a drenagem de condensado do reservatório', 'check', null, null, null, false, null),
        (v_template_id, 5, 'Lubrificação', 'Nível de óleo lubrificante', 'check', null, null, null, true, null),
        (v_template_id, 6, 'Lubrificação', 'Coloração e aspecto do óleo', 'select', null, null, null, false, 'Bom|Escuro|Trocar'),
        (v_template_id, 7, 'Lubrificação', 'Temperatura de operação do óleo', 'measure', 0, 90, '°C', false, null),
        (v_template_id, 8, 'Lubrificação', 'Verificar obstrução do filtro de óleo', 'check', null, null, null, false, null),
        (v_template_id, 9, 'Geral', 'Tensão e estado de conservação das correias', 'check', null, null, null, false, null),
        (v_template_id, 10, 'Geral', 'Limpeza externa das aletas de refrigeração', 'check', null, null, null, false, null),
        (v_template_id, 11, 'Geral', 'Reaperto de parafusos de fixação (base/motor)', 'check', null, null, null, false, null),
        (v_template_id, 12, 'Geral', 'Foto geral do painel de controle/manômetros', 'photo', null, null, null, false, null);

    -- 3. Verificação de Instrumento de Medição
    INSERT INTO checklist_templates (company_id, name, description, category, is_global)
    VALUES (v_company_id, 'Verificação de Instrumento de Medição', 'Rotina de check-up funcional prévio ao uso ou calibração.', 'Geral', true)
    RETURNING id INTO v_template_id;

    INSERT INTO checklist_template_items (template_id, sort_order, group_name, description, item_type, requires_photo)
    VALUES 
        (v_template_id, 1, 'Verificação Visual e Funcional', 'Estado físico geral (vidro, caixa, ponteiro/display)', 'check', false),
        (v_template_id, 2, 'Verificação Visual e Funcional', ' Display ou escala analógica está perfeitamente legível', 'check', false),
        (v_template_id, 3, 'Verificação Visual e Funcional', 'Zeragem ou ajuste de zero funcional', 'check', false),
        (v_template_id, 4, 'Verificação Visual e Funcional', 'Foto legível da etiqueta de calibração atual', 'photo', false),
        (v_template_id, 5, 'Verificação Visual e Funcional', 'Certificado de calibração dentro da validade', 'check', false),
        (v_template_id, 6, 'Verificação Visual e Funcional', 'Resolução do instrumento (conforme manual/processo)', 'text', false),
        (v_template_id, 7, 'Verificação Visual e Funcional', 'Teste funcional básico (resposta a estímulo)', 'check', false),
        (v_template_id, 8, 'Verificação Visual e Funcional', 'Foto panorâmica do instrumento identificado', 'photo', false);

END $$;
