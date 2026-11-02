"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { API, callApi } from "@/lib/api";
import { mediaUrl } from "@/lib/format";
import { Field, inputClass } from "@/components/Form";

const TEXT_FIELDS = [
  ["ten_website", "Tên website", "text"],
  ["hotline", "Hotline", "text"],
  ["email", "Email", "email"],
  ["dia_chi", "Địa chỉ", "text"],
  ["facebook", "Facebook", "url"],
  ["instagram", "Instagram", "url"],
  ["youtube", "YouTube", "url"],
  ["seo_title", "Tiêu đề SEO mặc định", "text"],
];

export default function WebsiteSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    callApi(`${API}/admin/cau-hinh-website`, { cache: "no-store" })
      .then((json) => active && setSettings(json.data ?? {}))
      .catch((cause) => active && setError(cause instanceof Error ? cause.message : "Không tải được cấu hình."));
    return () => { active = false; };
  }, []);

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const body = new FormData(event.currentTarget);
      const json = await callApi(`${API}/admin/cau-hinh-website`, { method: "POST", body });
      setSettings(json.data);
      setNotice("Đã lưu cấu hình website.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không lưu được cấu hình.");
    } finally {
      setBusy(false);
    }
  }

  if (!settings) return <p className="text-sm text-slate-500">{error || "Đang tải cấu hình..."}</p>;

  return <section className="mx-auto max-w-4xl space-y-5">
    <div><h1 className="text-2xl font-bold">Cấu hình website</h1><p className="mt-1 text-sm text-slate-600">Thông tin thương hiệu, liên hệ, mạng xã hội và SEO mặc định.</p></div>
    <form onSubmit={save} className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2">
      {TEXT_FIELDS.map(([name, label, type]) => <Field key={name} label={label} required={name === "ten_website"}><input name={name} type={type} required={name === "ten_website"} defaultValue={settings[name] ?? ""} className={inputClass} /></Field>)}
      <Field label="Mô tả SEO mặc định" wide><textarea name="seo_description" defaultValue={settings.seo_description ?? ""} rows={3} className={inputClass} /></Field>
      {["logo", "favicon"].map((name) => <Field key={name} label={`${name === "logo" ? "Logo" : "Favicon"} (chọn file mới nếu muốn thay)`}>
        {settings[name] && <Image src={mediaUrl(settings[name])} alt="" width={100} height={60} unoptimized className="mb-2 h-12 w-auto object-contain" />}
        <input name={name} type="file" accept="image/*" className={inputClass} />
      </Field>)}
      {error && <p role="alert" className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="sm:col-span-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
      <div className="sm:col-span-2"><button disabled={busy} className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Đang lưu..." : "Lưu cấu hình"}</button></div>
    </form>
  </section>;
}
