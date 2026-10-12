// Hai nút "Sửa" và "Xoá" ở cuối mỗi dòng (dùng cho danh mục, thương hiệu, sản phẩm)

type RowActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export default function RowActions({ onEdit, onDelete }: RowActionsProps) {
  return (
    <>
      <button
        onClick={onEdit}
        className="mr-2 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 hover:bg-teal-100"
      >
        Sửa
      </button>
      <button
        onClick={onDelete}
        className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
      >
        Xoá
      </button>
    </>
  );
}
