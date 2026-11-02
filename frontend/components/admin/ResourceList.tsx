"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API, callApi, useList, type Row } from "@/lib/api";
import { RESOURCES } from "@/lib/admin-config";
import { getToken } from "@/lib/auth";
import Notice from "@/components/Notice";
import PageHeader from "@/components/PageHeader";
import RowActions from "@/components/RowActions";
import { Table, Td, Tr } from "@/components/Table";
import Pagination from "@/components/common/Pagination";

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
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rows ?? [];

    return (rows ?? []).filter((row) => JSON.stringify(row).toLowerCase().includes(keyword));
  }, [rows, search]);

  const visibleRows = useMemo(() => {
    const filtered = filteredRows.filter((row) => {
      if (statusFilter) {
        const status = resource?.key === "lien-he" || resource?.key === "don-hang"
          ? row.trang_thai
          : String(Boolean(row.status));
        if (String(status) !== statusFilter) return false;
      }
      const created = String(row.created_at ?? "").slice(0, 10);
      if (fromDate && created < fromDate) return false;
      if (toDate && created > toDate) return false;
      return true;
    });
    return filtered;
  }, [filteredRows, fromDate, resource?.key, statusFilter, toDate]);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const pagedRows = visibleRows.slice((page - 1) * pageSize, page * pageSize);

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

  async function confirmPayment(row: Row) {
    if (!confirm(`Bạn đã thấy tiền của đơn ${row.ma_don_hang} trong MoMo?`)) return;

    try {
      await callApi(`${API}/don-hang/${row.id}/xac-nhan-thanh-toan`, { method: "POST" }, getToken() ?? undefined);
      setNotice({ text: "Đã xác nhận thanh toán", ok: true });
      reload();
    } catch (cause) {
      setNotice({ text: cause instanceof Error ? cause.message : "Không xác nhận được thanh toán.", ok: false });
    }
  }

  async function cancelOrder(row: Row) {
    if (!confirm(`Huỷ đơn ${row.ma_don_hang}?`)) return;

    try {
      await callApi(`${API}/don-hang/${row.id}/huy`, { method: "POST" }, getToken() ?? undefined);
      setNotice({ text: "Đã huỷ đơn", ok: true });
      reload();
    } catch (cause) {
      setNotice({ text: cause instanceof Error ? cause.message : "Không huỷ được đơn hàng.", ok: false });
    }
  }

  async function deleteContact(row: Row) {
    if (!confirm("Xóa liên hệ đã xử lý này? Hành động không thể hoàn tác.")) return;
    try {
      await callApi(`${API}/admin/lien-he/${row.id}`, { method: "DELETE" });
      setNotice({ text: "Đã xóa liên hệ", ok: true });
      reload();
    } catch (cause) {
      setNotice({ text: cause instanceof Error ? cause.message : "Không xóa được liên hệ.", ok: false });
    }
  }

  if (!resource) return <p>Không có mục này.</p>;

  const hasActions = Boolean(editPath) || ["don-hang", "lien-he", "nguoi-dung"].includes(resource.key);

  return (
    <>
      <PageHeader
        title={resource.title}
        count={visibleRows.length}
        search={search}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        onAdd={editPath ? () => router.push(`/admin/${editPath}/create`) : undefined}
      />
      {["don-hang", "lien-he", "nguoi-dung", "danh-muc", "thuong-hieu", "san-pham"].includes(resource.key) && (
        <div className="mb-4 flex flex-wrap gap-3">
          <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="">Mọi trạng thái</option>
            {resource.key === "don-hang" && <>
              <option value="cho_xac_nhan">Chờ xác nhận</option><option value="da_xac_nhan">Đã xác nhận</option><option value="dang_giao">Đang giao</option><option value="hoan_tat">Hoàn tất</option><option value="da_huy">Đã hủy</option>
            </>}
            {resource.key === "lien-he" && <><option value="chua_xu_ly">Chưa xử lý</option><option value="da_xu_ly">Đã xử lý</option></>}
            {resource.key === "nguoi-dung" && <><option value="true">Hoạt động</option><option value="false">Bị khóa</option></>}
            {["danh-muc", "thuong-hieu", "san-pham"].includes(resource.key) && <><option value="true">Đang hiển thị</option><option value="false">Đang ẩn</option></>}
          </select>
          {resource.key === "don-hang" && <>
            <label className="flex items-center gap-2 text-sm text-slate-600">Từ ngày<input type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(1); }} className="rounded-lg border px-3 py-2" /></label>
            <label className="flex items-center gap-2 text-sm text-slate-600">Đến ngày<input type="date" value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(1); }} className="rounded-lg border px-3 py-2" /></label>
          </>}
        </div>
      )}

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
          isEmpty={visibleRows.length === 0}
        >
          {pagedRows.map((row, index) => (
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
                  {resource.key === "don-hang" && row.phuong_thuc_thanh_toan === "momo_qr" && row.trang_thai !== "da_huy" && row.trang_thai_thanh_toan !== "da_thanh_toan" && (
                    <button
                      type="button"
                      onClick={() => void confirmPayment(row)}
                      className="mr-2 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      Đã nhận tiền
                    </button>
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
                  {resource.key === "lien-he" && (
                    <>
                      <button
                        type="button"
                        onClick={() => router.push(`/admin/contacts/${row.id}`)}
                        className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 hover:bg-teal-100"
                      >
                        {row.trang_thai === "da_xu_ly" ? "Xem / cập nhật" : "Tiếp nhận"}
                      </button>
                      {row.trang_thai === "da_xu_ly" && (
                        <button type="button" onClick={() => void deleteContact(row)} className="ml-2 text-red-600 hover:underline">Xóa</button>
                      )}
                    </>
                  )}
                  {resource.key === "don-hang" && <button type="button" onClick={() => router.push(`/admin/orders/${row.id}`)} className="mr-2 text-teal-700 hover:underline">Chi tiết</button>}
                  {resource.key === "nguoi-dung" && <button type="button" onClick={() => router.push(`/admin/users/${row.id}`)} className="text-teal-700 hover:underline">Chi tiết</button>}
                </Td>
              )}
            </Tr>
          ))}
        </Table>
      )}

      {visibleRows.length > pageSize && <div className="mt-5 flex justify-center"><Pagination currentPage={page} pageCount={pageCount} onPageChange={setPage} /></div>}

    </>
  );
}
