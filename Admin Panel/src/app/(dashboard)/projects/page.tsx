"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import { ClipboardCheck, Plus } from "lucide-react";
import { PageShell } from "@/layout/PageShell";
import { Button } from "@/components/ui/button";
import {
  DynamicTable,
  deleteRowAction,
  editRowAction,
  viewRowAction,
  type TableRowAction,
} from "@/components/dynamicTable";
import type { ListQueryPayload } from "@/lib/filter-builder-v2";
import {
  buildModuleNameMap,
  formatModuleIdsAsNames,
} from "@/lib/format-module-labels";
import { defaultListQuery } from "@/lib/list-query";
import { GetAllParentModulesList } from "@/services/api/parent-modules.api";
import {
  DeleteProject,
  GetAllProjectsList,
} from "@/services/api/projects.api";
import type { ProjectMasterRow } from "@/types/project-master.types";
import { withStatusSetFilter } from "@/lib/table-column-utils";

export default function ProjectMasterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [moduleNameById, setModuleNameById] = useState<Map<number, string>>(
    () => new Map()
  );

  useEffect(() => {
    GetAllParentModulesList(defaultListQuery)
      .then((res) => setModuleNameById(buildModuleNameMap(res.rows)))
      .catch(() => setModuleNameById(new Map()));
  }, []);

  const formatModules = useCallback(
    (params: ValueFormatterParams<ProjectMasterRow, number[]>) =>
      formatModuleIdsAsNames(params.value, moduleNameById),
    [moduleNameById]
  );

  const fetchProjects = useCallback(async (query: ListQueryPayload) => {
    try {
      const result = await GetAllProjectsList(query);
      setError("");
      return result;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load projects"
      );
      return { rows: [], total: 0 };
    }
  }, []);

  const columnDefs = useMemo<ColDef<ProjectMasterRow>[]>(
    () =>
      withStatusSetFilter([
        { field: "name", headerName: "Project Name", minWidth: 180 },
        {
          field: "description",
          headerName: "Description",
          minWidth: 200,
          valueFormatter: (p) => p.value || "—",
        },
        {
          field: "project_start_at",
          headerName: "Start Date",
          minWidth: 140,
        },
        {
          field: "status",
          headerName: "Status",
          minWidth: 130,
        },
        {
          field: "module_ids",
          headerName: "Modules",
          minWidth: 200,
          flex: 1.2,
          valueFormatter: formatModules,
        },
      ]),
    [formatModules]
  );

  const rowActions = useMemo<TableRowAction<ProjectMasterRow>[]>(
    () => [
      viewRowAction((row) => router.push(`/projects/${row.id}`)),
      editRowAction((row) => router.push(`/projects/${row.id}/edit`)),
      deleteRowAction(async (row) => {
        await DeleteProject(row.id);
        router.refresh();
      }),
    ],
    [router]
  );

  return (
    <PageShell title="Project Master" description="Manage projects and modules">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          render={<Link href="/projects/check" />}
          className="h-10 gap-2"
        >
          <ClipboardCheck className="size-4" />
          Check Project
        </Button>
        <Button
          render={<Link href="/projects/create" />}
          className="h-10 gap-2"
        >
          <Plus className="size-4" />
          Create Project
        </Button>
      </div>
      <DynamicTable<ProjectMasterRow>
        rowData={[]}
        columnDefs={columnDefs}
        rowActions={rowActions}
        onServerFilter={fetchProjects}
        dateFields={["project_start_at"]}
        emptyMessage="No projects found"
        height="560px"
      />
    </PageShell>
  );
}
