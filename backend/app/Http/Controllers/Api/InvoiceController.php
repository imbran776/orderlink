<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Invoice::with('order.retailer');

        if ($user->isRetailer()) {
            $query->whereHas('order', fn ($q) => $q->where('retailer_id', $user->id));
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->paginate(15));
    }

    public function show(Request $request, Invoice $invoice)
    {
        // Retailer hanya boleh lihat invoice miliknya
        if ($request->user()->isRetailer() &&
            $invoice->order->retailer_id !== $request->user()->id) {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        return response()->json(['data' => $invoice->load('order.items.product', 'order.retailer')]);
    }

    public function download(Request $request, Invoice $invoice)
    {
        // Cek akses: retailer hanya bisa download invoice miliknya sendiri
        if ($request->user()->isRetailer() && $invoice->order->retailer_id !== $request->user()->id) {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $invoice->load('order.items.product', 'order.retailer');
        $pdf = Pdf::loadView('invoices.pdf', compact('invoice'));
        $pdf->setPaper('A4', 'portrait');

        return $pdf->download("Invoice-{$invoice->invoice_number}.pdf");
    }
}
