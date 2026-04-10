"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronDown,
  MapPin,
  Folder,
  Wrench,
  Gauge,
  Circle,
} from "lucide-react";
import { CriticalityBadge, StatusBadge } from "@/components/shared/badges";
import { cn } from "@/lib/utils";
import type { Asset, AssetCategory, AssetLocation } from "@/lib/types/database";

interface AssetTreeViewProps {
  assets: Asset[];
  locations: AssetLocation[];
  categories: AssetCategory[];
}

interface TreeNode {
  id: string;
  label: string;
  type: "location" | "category" | "asset";
  icon: React.ReactNode;
  children: TreeNode[];
  asset?: Asset;
  count: number;
}

function buildTree(
  assets: Asset[],
  locations: AssetLocation[],
  categories: AssetCategory[]
): TreeNode[] {
  const locationMap = new Map<string, AssetLocation>();
  locations.forEach((l) => locationMap.set(l.id, l));

  const categoryMap = new Map<string, AssetCategory>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  const rootLocations = locations.filter((l) => !l.parent_id);
  const childLocations = locations.filter((l) => l.parent_id);

  function buildLocationNode(loc: AssetLocation): TreeNode {
    const locAssets = assets.filter((a) => a.location_id === loc.id);
    const children: TreeNode[] = [];

    const subLocations = childLocations.filter((cl) => cl.parent_id === loc.id);
    for (const sub of subLocations) {
      children.push(buildLocationNode(sub));
    }

    const catGroups = new Map<string, Asset[]>();
    const uncategorized: Asset[] = [];

    for (const a of locAssets) {
      if (a.category_id) {
        const group = catGroups.get(a.category_id) || [];
        group.push(a);
        catGroups.set(a.category_id, group);
      } else {
        uncategorized.push(a);
      }
    }

    for (const [catId, catAssets] of catGroups) {
      const cat = categoryMap.get(catId);
      children.push({
        id: `${loc.id}-${catId}`,
        label: cat?.name || "Sem categoria",
        type: "category",
        icon: <Folder className="h-3.5 w-3.5 text-amber-500" />,
        count: catAssets.length,
        children: catAssets.map((a) => assetToNode(a)),
      });
    }

    for (const a of uncategorized) {
      children.push(assetToNode(a));
    }

    return {
      id: loc.id,
      label: loc.name,
      type: "location",
      icon: <MapPin className="h-3.5 w-3.5 text-blue-500" />,
      count: locAssets.length + subLocations.reduce((s, sl) => s + assets.filter((a) => a.location_id === sl.id).length, 0),
      children,
    };
  }

  function assetToNode(a: Asset): TreeNode {
    return {
      id: a.id,
      label: `${a.tag} — ${a.name}`,
      type: "asset",
      icon:
        a.asset_type === "equipment" ? (
          <Wrench className="h-3.5 w-3.5 text-zinc-500" />
        ) : (
          <Gauge className="h-3.5 w-3.5 text-violet-500" />
        ),
      count: 0,
      children: [],
      asset: a,
    };
  }

  const tree: TreeNode[] = [];

  for (const loc of rootLocations) {
    tree.push(buildLocationNode(loc));
  }

  const unlocatedAssets = assets.filter((a) => !a.location_id);
  if (unlocatedAssets.length > 0) {
    const catGroups = new Map<string, Asset[]>();
    const uncategorized: Asset[] = [];
    for (const a of unlocatedAssets) {
      if (a.category_id) {
        const group = catGroups.get(a.category_id) || [];
        group.push(a);
        catGroups.set(a.category_id, group);
      } else {
        uncategorized.push(a);
      }
    }

    const noLocChildren: TreeNode[] = [];
    for (const [catId, catAssets] of catGroups) {
      const cat = categoryMap.get(catId);
      noLocChildren.push({
        id: `noloc-${catId}`,
        label: cat?.name || "Sem categoria",
        type: "category",
        icon: <Folder className="h-3.5 w-3.5 text-amber-500" />,
        count: catAssets.length,
        children: catAssets.map((a) => assetToNode(a)),
      });
    }
    for (const a of uncategorized) {
      noLocChildren.push(assetToNode(a));
    }

    tree.push({
      id: "no-location",
      label: "Sem localização",
      type: "location",
      icon: <MapPin className="h-3.5 w-3.5 text-zinc-400" />,
      count: unlocatedAssets.length,
      children: noLocChildren,
    });
  }

  return tree;
}

function TreeNodeItem({
  node,
  depth = 0,
}: {
  node: TreeNode;
  depth?: number;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(depth < 1);

  const isLeaf = node.type === "asset";
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors cursor-pointer group",
          isLeaf
            ? "hover:bg-primary/5"
            : "hover:bg-muted/50"
        )}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => {
          if (isLeaf) {
            router.push(`/assets/${node.id}`);
          } else {
            setExpanded(!expanded);
          }
        }}
      >
        {/* Expand/collapse icon */}
        {!isLeaf && hasChildren ? (
          expanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          )
        ) : !isLeaf ? (
          <Circle className="h-2 w-2 text-muted-foreground/30 shrink-0 ml-0.5 mr-0.5" />
        ) : (
          <div className="w-3.5 shrink-0" />
        )}

        {/* Icon */}
        {node.icon}

        {/* Label */}
        <span
          className={cn(
            "text-sm truncate flex-1",
            isLeaf
              ? "text-foreground group-hover:text-primary"
              : "font-semibold text-foreground"
          )}
        >
          {node.label}
        </span>

        {/* Badges for assets */}
        {node.asset && (
          <div className="flex items-center gap-1.5 shrink-0">
            <CriticalityBadge level={node.asset.criticality} />
            <StatusBadge status={node.asset.status} />
          </div>
        )}

        {/* Count for groups */}
        {!isLeaf && node.count > 0 && (
          <span className="text-[10px] font-bold text-muted-foreground bg-muted rounded-full px-2 py-0.5 shrink-0">
            {node.count}
          </span>
        )}
      </div>

      {/* Children */}
      {expanded &&
        hasChildren &&
        node.children.map((child) => (
          <TreeNodeItem key={child.id} node={child} depth={depth + 1} />
        ))}
    </div>
  );
}

export function AssetTreeView({
  assets,
  locations,
  categories,
}: AssetTreeViewProps) {
  const tree = useMemo(
    () => buildTree(assets, locations, categories),
    [assets, locations, categories]
  );

  if (tree.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground italic">
        Nenhum ativo cadastrado.
      </div>
    );
  }

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl shadow-card p-3 space-y-0.5">
      {tree.map((node) => (
        <TreeNodeItem key={node.id} node={node} />
      ))}
    </div>
  );
}
