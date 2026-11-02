<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\BaiViet;
use App\Models\CauHinhWebsite;
use App\Models\ChuDeBaiViet;
use App\Models\MucMenu;
use App\Models\TrangDon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminNoiDungController extends Controller
{
    public function topics(Request $request)
    {
        return $this->list(ChuDeBaiViet::query(), $request, ['ten_chu_de', 'slug']);
    }

    public function storeTopic(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ten_chu_de' => 'required|string|max:255',
            'status' => 'required|boolean',
        ]);
        $data['slug'] = $this->slug(ChuDeBaiViet::class, $data['ten_chu_de']);

        return response()->json(['data' => ChuDeBaiViet::create($data)], 201);
    }

    public function updateTopic(Request $request, ChuDeBaiViet $chuDeBaiViet): JsonResponse
    {
        $data = $request->validate([
            'ten_chu_de' => 'required|string|max:255',
            'status' => 'required|boolean',
        ]);
        $data['slug'] = $this->slug(ChuDeBaiViet::class, $data['ten_chu_de'], $chuDeBaiViet->id);
        $chuDeBaiViet->update($data);

        return response()->json(['data' => $chuDeBaiViet->fresh()]);
    }

    public function destroyTopic(ChuDeBaiViet $chuDeBaiViet): JsonResponse
    {
        if ($chuDeBaiViet->baiViets()->exists()) {
            return response()->json(['message' => 'Không thể xóa chủ đề đang có bài viết.'], 409);
        }
        $chuDeBaiViet->delete();

        return response()->json(['message' => 'Đã xóa chủ đề bài viết.']);
    }

    public function posts(Request $request)
    {
        $query = BaiViet::with('chuDe')->orderByDesc('id');
        return $this->list($query, $request, ['tieu_de', 'tom_tat']);
    }

    public function storePost(Request $request): JsonResponse
    {
        $data = $request->validate([
            'chu_de_id' => 'required|integer|exists:chu_de_bai_viet,id',
            'tieu_de' => 'required|string|max:255',
            'tom_tat' => 'nullable|string|max:5000',
            'noi_dung' => 'required|string',
            'status' => 'required|boolean',
            'hinh_anh' => 'nullable|image|max:4096',
        ]);
        $data['slug'] = $this->slug(BaiViet::class, $data['tieu_de']);
        if ($request->hasFile('hinh_anh')) {
            $data['hinh_anh'] = $request->file('hinh_anh')->store('bai-viet', 'public');
        }

        return response()->json(['data' => BaiViet::create($data)->load('chuDe')], 201);
    }

    public function updatePost(Request $request, BaiViet $baiViet): JsonResponse
    {
        $data = $request->validate([
            'chu_de_id' => 'required|integer|exists:chu_de_bai_viet,id',
            'tieu_de' => 'required|string|max:255',
            'tom_tat' => 'nullable|string|max:5000',
            'noi_dung' => 'required|string',
            'status' => 'required|boolean',
            'hinh_anh' => 'nullable|image|max:4096',
        ]);
        $data['slug'] = $this->slug(BaiViet::class, $data['tieu_de'], $baiViet->id);
        if ($request->hasFile('hinh_anh')) {
            if ($baiViet->hinh_anh) {
                Storage::disk('public')->delete($baiViet->hinh_anh);
            }
            $data['hinh_anh'] = $request->file('hinh_anh')->store('bai-viet', 'public');
        } else {
            unset($data['hinh_anh']);
        }
        $baiViet->update($data);

        return response()->json(['data' => $baiViet->fresh('chuDe')]);
    }

    public function destroyPost(BaiViet $baiViet): JsonResponse
    {
        if ($baiViet->hinh_anh) {
            Storage::disk('public')->delete($baiViet->hinh_anh);
        }
        $baiViet->delete();

        return response()->json(['message' => 'Đã xóa bài viết.']);
    }

    public function pages(Request $request)
    {
        return $this->list(TrangDon::query()->orderByDesc('id'), $request, ['tieu_de', 'slug']);
    }

    public function storePage(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tieu_de' => 'required|string|max:255',
            'noi_dung' => 'nullable|string',
            'status' => 'required|boolean',
        ]);
        $data['slug'] = $this->slug(TrangDon::class, $data['tieu_de']);

        return response()->json(['data' => TrangDon::create($data)], 201);
    }

    public function updatePage(Request $request, TrangDon $trangDon): JsonResponse
    {
        $data = $request->validate([
            'tieu_de' => 'required|string|max:255',
            'noi_dung' => 'nullable|string',
            'status' => 'required|boolean',
        ]);
        $data['slug'] = $this->slug(TrangDon::class, $data['tieu_de'], $trangDon->id);
        $trangDon->update($data);

        return response()->json(['data' => $trangDon->fresh()]);
    }

    public function destroyPage(TrangDon $trangDon): JsonResponse
    {
        $trangDon->delete();

        return response()->json(['message' => 'Đã xóa trang tĩnh.']);
    }

    public function menus(Request $request)
    {
        return $this->list(MucMenu::with('parent')->orderBy('thu_tu'), $request, ['ten_menu', 'url']);
    }

    public function storeMenu(Request $request): JsonResponse
    {
        $data = $this->menuData($request);

        return response()->json(['data' => MucMenu::create($data)], 201);
    }

    public function updateMenu(Request $request, MucMenu $mucMenu): JsonResponse
    {
        $data = $this->menuData($request, $mucMenu);
        $mucMenu->update($data);

        return response()->json(['data' => $mucMenu->fresh('parent')]);
    }

    public function destroyMenu(MucMenu $mucMenu): JsonResponse
    {
        if ($mucMenu->children()->exists()) {
            return response()->json(['message' => 'Hãy xóa hoặc chuyển các mục menu con trước.'], 409);
        }
        $mucMenu->delete();

        return response()->json(['message' => 'Đã xóa mục menu.']);
    }

    public function banners(Request $request)
    {
        return $this->list(Banner::query()->orderBy('thu_tu')->orderByDesc('id'), $request, ['tieu_de', 'lien_ket']);
    }

    public function storeBanner(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tieu_de' => 'nullable|string|max:255',
            'lien_ket' => 'nullable|string|max:500',
            'thu_tu' => 'nullable|integer|min:0',
            'status' => 'required|boolean',
            'hinh_anh' => 'required|image|max:4096',
        ]);
        $data['hinh_anh'] = $request->file('hinh_anh')->store('banner', 'public');

        return response()->json(['data' => Banner::create($data)], 201);
    }

    public function updateBanner(Request $request, Banner $banner): JsonResponse
    {
        $data = $request->validate([
            'tieu_de' => 'nullable|string|max:255',
            'lien_ket' => 'nullable|string|max:500',
            'thu_tu' => 'nullable|integer|min:0',
            'status' => 'required|boolean',
            'hinh_anh' => 'nullable|image|max:4096',
        ]);
        if ($request->hasFile('hinh_anh')) {
            Storage::disk('public')->delete($banner->hinh_anh);
            $data['hinh_anh'] = $request->file('hinh_anh')->store('banner', 'public');
        } else {
            unset($data['hinh_anh']);
        }
        $banner->update($data);

        return response()->json(['data' => $banner->fresh()]);
    }

    public function destroyBanner(Banner $banner): JsonResponse
    {
        Storage::disk('public')->delete($banner->hinh_anh);
        $banner->delete();

        return response()->json(['message' => 'Đã xóa banner.']);
    }

    public function settings(): JsonResponse
    {
        return response()->json(['data' => CauHinhWebsite::first()]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ten_website' => 'required|string|max:255',
            'hotline' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'dia_chi' => 'nullable|string|max:255',
            'facebook' => 'nullable|url|max:255',
            'instagram' => 'nullable|url|max:255',
            'youtube' => 'nullable|url|max:255',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:5000',
            'logo' => 'nullable|image|max:4096',
            'favicon' => 'nullable|image|max:1024',
        ]);
        $settings = CauHinhWebsite::first();
        foreach (['logo', 'favicon'] as $image) {
            if ($request->hasFile($image)) {
                if ($settings?->{$image}) {
                    Storage::disk('public')->delete($settings->{$image});
                }
                $data[$image] = $request->file($image)->store('website', 'public');
            } else {
                unset($data[$image]);
            }
        }
        $settings = $settings
            ? tap($settings)->update($data)
            : CauHinhWebsite::create($data);

        return response()->json(['message' => 'Đã lưu cấu hình website.', 'data' => $settings->fresh()]);
    }

    private function list($query, Request $request, array $searchFields)
    {
        if ($request->filled('keyword')) {
            $keyword = '%'.$request->keyword.'%';
            $query->where(function ($builder) use ($keyword, $searchFields) {
                foreach ($searchFields as $field) {
                    $builder->orWhere($field, 'like', $keyword);
                }
            });
        }
        if ($request->filled('status')) {
            $query->where('status', (int) $request->status);
        }

        return $request->filled('per_page')
            ? $query->paginate((int) $request->per_page)->withQueryString()
            : response()->json(['data' => $query->get()]);
    }

    private function menuData(Request $request, ?MucMenu $mucMenu = null): array
    {
        $data = $request->validate([
            'ten_menu' => 'required|string|max:255',
            'url' => 'nullable|string|max:500',
            'parent_id' => 'nullable|integer|exists:muc_menu,id',
            'thu_tu' => 'nullable|integer|min:0',
            'status' => 'required|boolean',
        ]);
        if ($mucMenu && (int) ($data['parent_id'] ?? 0) === $mucMenu->id) {
            abort(422, 'Mục menu không thể là cha của chính nó.');
        }

        return $data;
    }

    private function slug(string $model, string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $suffix = 1;
        while ($model::where('slug', $slug)->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }
}
