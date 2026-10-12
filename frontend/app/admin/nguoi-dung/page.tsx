"use client";

// =====================================================================
// TRANG NGƯỜI DÙNG  ->  mở bằng đường link /admin/nguoi-dung
//
// Chức năng: xem danh sách tài khoản + tìm kiếm (chỉ xem, không sửa)
// =====================================================================

import { useState } from "react";
import { useList } from "@/lib/api";
import { matches } from "@/lib/format";
import Badge from "../../components/Badge";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import { Table, Tr, Td } from "../../components/Table";

export default function NguoiDungPage() {
  const { rows, error } = useList("nguoi-dung");
  const [search, setSearch] = useState("");

  // Lọc theo ô tìm kiếm (tìm theo ID, username, họ tên, email, SĐT, địa chỉ, vai trò)
  const list = (rows ?? []).filter((r) =>
    matches(search, [r.id, r.username, r.ho_ten, r.email, r.so_dien_thoai, r.dia_chi, r.vai_tro])
  );

  return (
    <>
      <PageHeader title="Người dùng" count={list.length} search={search} onSearch={setSearch} />

      <Notice text={error} />
      {!rows && !error && <p className="text-slate-500">Đang tải…</p>}

      {rows && (
        <Table
          headers={["ID", "Username", "Họ tên", "Email", "SĐT", "Địa chỉ", "Vai trò", "Trạng thái"]}
          isEmpty={list.length === 0}
        >
          {list.map((r) => (
            <Tr key={r.id}>
              <Td>{r.id}</Td>
              <Td>{r.username}</Td>
              <Td>{r.ho_ten ?? "—"}</Td>
              <Td>{r.email}</Td>
              <Td>{r.so_dien_thoai ?? "—"}</Td>
              <Td>{r.dia_chi ?? "—"}</Td>
              <Td>
                <Badge text={r.vai_tro} tone={r.vai_tro === "admin" ? "warn" : "off"} />
              </Td>
              <Td>
                <Badge text={r.status ? "Hoạt động" : "Bị khoá"} tone={r.status ? "ok" : "off"} />
              </Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
}
