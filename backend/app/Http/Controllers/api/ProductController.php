<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function allProducts()
    {
        $products = Product::select('id', 'brand', 'name', 'price','description', 'image',)
            ->get();

        $products->transform(function ($item) {
            $item->image = asset('storage/' . $item->image);
            return $item;
        });

        return response()->json($products);
    }
    public function viralProducts()
    {
        $products = Product::where('is_viral', 1)
            ->select('id', 'brand', 'name', 'price', 'description', 'image')
            ->get();

        // Convert image path to full URL
        $products->transform(function ($item) {
            $item->image = asset('storage/' . $item->image);
            return $item;
        });

        return response()->json($products);
    }
    public function show($id)
    {
        $product = Product::findOrFail($id);

        $product->image = asset('storage/' . $product->image);

        return $product;
    }

    public function productsByCategory($id)
{
    $products = Product::with('category')
        ->where('category_id', $id)
        ->get();

    $products->transform(function ($item) {
        $item->image = asset('storage/' . $item->image);
        $item->category_name = $item->category->name ?? null;
        return $item;
    });

    return response()->json($products);
}
    public function categories()
    {
        $categories = Category::select('id', 'name', 'image')->get();

        $categories->transform(function ($item) {
            $item->image = asset('storage/' . $item->image);
            return $item;
        });

        return response()->json($categories);
    }
}