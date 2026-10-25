// Bảng dữ liệu dùng chung. Cách dùng ở mỗi trang:
//
//   <Table headers={["ID", "Tên"]} hasActions isEmpty={list.length === 0}>
//     <Tr><Td>1</Td><Td>Áo thun</Td><Td right>...nút Sửa / Xoá...</Td></Tr>
//   </Table>
//
//   headers    : tên các cột
//   hasActions : true = thêm 1 cột "Thao tác" ở cuối
//   isEmpty    : true = hiện dòng "Không có dữ liệu"

type TableProps = {
  headers: string[];
  hasActions?: boolean;
  isEmpty: boolean;
  children: React.ReactNode;
};

export function Table({ headers, hasActions, isEmpty, children }: TableProps) {
  const columnCount = headers.length + (hasActions ? 1 : 0);

  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-stone-100/80 text-slate-600">
          <tr>
            {headers.map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 font-medium">
                {h}
              </th>
            ))}
            {hasActions && <th className="px-4 py-3 text-right font-medium">Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {children}
          {isEmpty && (
            <tr>
              <td colSpan={columnCount} className="px-4 py-10 text-center text-slate-500">
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Một dòng của bảng
export function Tr({ children }: { children: React.ReactNode }) {
  return <tr className="border-t border-stone-100 align-middle even:bg-stone-50/50 hover:bg-teal-50/40">{children}</tr>;
}

// Một ô của bảng (right = ô cuối cùng chứa nút, căn phải)
export function Td({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <td className={right ? "whitespace-nowrap px-4 py-3 text-right" : "px-4 py-3"}>{children}</td>;
}
