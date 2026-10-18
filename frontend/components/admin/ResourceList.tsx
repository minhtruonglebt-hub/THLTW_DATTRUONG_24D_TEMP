"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API, callApi, useList, type Row } from "@/lib/api";
import { RESOURCES } from "@/lib/admin-config";
import Notice from "@/components/Notice";
import PageHeader from "@/components/PageHeader";
import RowActions from "@/components/RowActions";
import { Table, Td, Tr } from "@/components/Table";

type ResourceListProps = {
  resourceKey: string;
  // Tên thư mục trong app/admin/ (vd: "categories"). Có -> hiện nút Thêm/Sửa dẫn tới /admin/<editPath>/create và /admin/<editPath>/{id}
  editPath?: string;
};

type NoticeMessage = {
  text: string;
  ok: boolean;
};

export default function ResourceList({ resourceKey, editPath }: ResourceListProps) {
  const resource = RESOURCES.find((item) => item.key === resourceKey);
  const router = useRouter();
  const { rows, error, loading, reload } = useList(resourceKey);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<NoticeMessage | null>(null);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rows ?? [];

    return (rows ?? []).filter((row) => JSON.stringify(row).toLowerCase().includes(keyword));
  }, [rows, search]);

  async function deleteRow(row: Row) {
    if (!resource || !confirm("Xoá mục này? Hành động không thể hoàn tác.")) return;

    try {
      await callApi(`${API}/${resource.key}/${row.id}`, { method: "DELETE" });
      setNotice({ text: "Đã xoá", ok: true });
      reload();
    } catch (cause) {
      setNotice({ text: cause instanceof Error ? cause.message : "Không xoá được dữ liệu.", ok: false });
    }
  }

  async function cancelOrder(row: Row) {
    if (!confirm(`Huỷ đơn ${row.ma_don_hang}?`)) return;

    try {
      await callApi(`${API}/don-hang/${row.id}/huy`, { method: "POST" });
      setNotice({ text: "Đã huỷ đơn", ok: true });
      reload();
    } catch (cause) {
      setNotice({ text: cause instanceof Error ? cause.message : "Không huỷ được đơn hàng.", ok: false });
    }
  }

  if (!resource) return <p>Không có mục này.</p>;

  const hasActions = Boolean(editPath) || resource.key === "don-hang";

  return (
    <>
      <PageHeader
        title={resource.title}
        count={filteredRows.length}
        search={search}
        onSearch={setSearch}
        onAdd={editPath ? () => router.push(`/admin/${editPath}/create`) : undefined}
      />

      <Notice text={error} />
      {notice && <Notice text={notice.text} ok={notice.ok} />}

      {loading && <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>}

      {error && (
        <button
          type="button"
          onClick={reload}
          className="mb-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Tải lại
        </button>
      )}

      {rows && (
        <Table
          headers={resource.columns.map((column) => column.label)}
          hasActions={hasActions}
          isEmpty={filteredRows.length === 0}
        >
          {filteredRows.map((row, index) => (
            <Tr key={row.id ?? index}>
              {resource.columns.map((column) => (
                <Td key={column.label}>{column.render(row)}</Td>
              ))}

              {hasActions && (
                <Td right>
                  {editPath && (
                    <RowActions
                      onEdit={() => router.push(`/admin/${editPath}/${row.id}`)}
                      onDelete={() => void deleteRow(row)}
                    />
                  )}
                  {resource.key === "don-hang" && row.trang_thai === "cho_xac_nhan" && (
                    <button
                      type="button"
                      onClick={() => void cancelOrder(row)}
                      className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
                    >
                      Huỷ đơn
                    </button>
                  )}
                </Td>
              )}
            </Tr>
          ))}
        </Table>
      )}

    </>
  );
}
