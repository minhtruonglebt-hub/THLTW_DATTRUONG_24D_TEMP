<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\CauHinhWebsite;
use App\Models\DanhMuc;
use App\Models\MucMenu;
use App\Models\TrangDon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class WebsiteController extends Controller
{
    public function menu(): JsonResponse
    {
        $menus = MucMenu::where('status', 1)->orderBy('thu_tu')->get();
        $pageSlugs = TrangDon::where('status', 1)->pluck('slug')->flip();

        $menus->each(function (MucMenu $menu) use ($pageSlugs) {
            $menu->url = $this->storefrontUrl($menu->url, $pageSlugs);
        });

        return response()->json(['data' => $menus]);
    }

    public function banners(): JsonResponse
    {
        $banners = Banner::where('status', 1)->orderBy('thu_tu')->get();
        $pageSlugs = TrangDon::where('status', 1)->pluck('slug')->flip();

        $banners->each(function (Banner $banner) use ($pageSlugs) {
            $banner->lien_ket = $this->storefrontUrl($banner->lien_ket, $pageSlugs);
            if (
                $banner->hinh_anh
                && !Str::startsWith($banner->hinh_anh, ['http://', 'https://'])
                && !Storage::disk('public')->exists($banner->hinh_anh)
                && !is_file(public_path($banner->hinh_anh))
            ) {
                $banner->hinh_anh = null;
            }
        });

        return response()->json(['data' => $banners]);
    }

    public function settings(): JsonResponse
    {
        return response()->json(['data' => CauHinhWebsite::first()]);
    }

    public function page(string $slug): JsonResponse
    {
        return response()->json(['data' => TrangDon::where('status', 1)->where('slug', $slug)->firstOrFail()]);
    }

    private function storefrontUrl(?string $url, $pageSlugs): ?string
    {
        if (!$url) {
            return $url;
        }

        if (parse_url($url, PHP_URL_SCHEME) !== null || parse_url($url, PHP_URL_HOST) !== null) {
            return $url;
        }

        $path = parse_url($url, PHP_URL_PATH) ?? '/';
        $query = parse_url($url, PHP_URL_QUERY);
        $fragment = parse_url($url, PHP_URL_FRAGMENT);
        $slug = trim($path, '/');
        $routes = [
            'san-pham' => '/products',
            'lien-he' => '/contact',
            'bai-viet' => '/posts',
        ];

        if (isset($routes[$slug])) {
            $path = $routes[$slug];
        } elseif (preg_match('#^danh-muc/([^/]+)$#', $slug, $matches)) {
            $categoryId = DanhMuc::where('slug', $matches[1])->where('status', 1)->value('id');
            $path = '/products';
            parse_str($query ?? '', $params);
            if ($categoryId !== null) {
                $params['category'] = $categoryId;
            }
            $query = http_build_query($params);
        } elseif ($slug !== '' && !str_contains($slug, '/') && $pageSlugs->has($slug)) {
            $path = '/pages/'.$slug;
        }

        return $path
            .($query ? '?'.$query : '')
            .($fragment ? '#'.$fragment : '');
    }
}
