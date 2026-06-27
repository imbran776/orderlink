<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 12px; color: #1a1a1a; background: #fff; }
        .container { padding: 40px; }

        /* Header */
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 700; color: #2563eb; }
        .logo span { color: #1a1a1a; }
        .invoice-title { text-align: right; }
        .invoice-title h2 { font-size: 28px; font-weight: 700; color: #2563eb; letter-spacing: 2px; }
        .invoice-title p { color: #6b7280; font-size: 11px; margin-top: 2px; }

        /* Info boxes */
        .info-row { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px; }
        .info-box { flex: 1; }
        .info-box h4 { font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .info-box p { font-size: 12px; line-height: 1.6; color: #1a1a1a; }
        .info-box .highlight { font-weight: 700; font-size: 14px; color: #2563eb; }

        /* Status badge */
        .status { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
        .status-unpaid  { background: #fef3c7; color: #92400e; }
        .status-paid    { background: #d1fae5; color: #065f46; }
        .status-overdue { background: #fee2e2; color: #991b1b; }

        /* Table */
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        thead tr { background: #2563eb; color: #fff; }
        thead th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        tbody tr { border-bottom: 1px solid #f3f4f6; }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:nth-child(even) { background: #f9fafb; }
        tbody td { padding: 10px 12px; font-size: 12px; }
        td.right, th.right { text-align: right; }
        td.center { text-align: center; }

        /* Totals */
        .totals { margin-left: auto; width: 260px; }
        .totals table { margin-bottom: 0; }
        .totals td { padding: 6px 12px; border-bottom: none; background: transparent !important; }
        .totals tr.total-row td { font-size: 14px; font-weight: 700; color: #2563eb; border-top: 2px solid #2563eb; padding-top: 10px; }

        /* Footer */
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; color: #9ca3af; font-size: 10px; }

        /* Watermark paid */
        .watermark { position: fixed; top: 40%; left: 20%; opacity: 0.06; font-size: 100px; font-weight: 900; color: #16a34a; transform: rotate(-30deg); letter-spacing: 10px; }
    </style>
</head>
<body>
<div class="container">

    @if($invoice->status === 'paid')
    <div class="watermark">LUNAS</div>
    @endif

    {{-- Header --}}
    <div class="header">
        <div>
            <div class="logo">🔗 Order<span>Link</span></div>
            <p style="color:#6b7280; font-size:11px; margin-top:4px;">Platform Distribusi B2B</p>
        </div>
        <div class="invoice-title">
            <h2>INVOICE</h2>
            <p>{{ $invoice->invoice_number }}</p>
            <p style="margin-top:6px;">
                <span class="status status-{{ $invoice->status }}">{{ strtoupper($invoice->status) }}</span>
            </p>
        </div>
    </div>

    {{-- Info --}}
    <div class="info-row">
        <div class="info-box">
            <h4>Tagihan Kepada</h4>
            <p><strong>{{ $invoice->order->retailer->company_name ?? $invoice->order->retailer->name }}</strong></p>
            <p>{{ $invoice->order->retailer->name }}</p>
            <p>{{ $invoice->order->retailer->phone }}</p>
            @if($invoice->order->retailer->address)
            <p>{{ $invoice->order->retailer->address }}</p>
            @endif
        </div>
        <div class="info-box">
            <h4>Detail Invoice</h4>
            <p>No. Invoice: <strong>{{ $invoice->invoice_number }}</strong></p>
            <p>No. Order: <strong>{{ $invoice->order->order_number }}</strong></p>
            <p>Tanggal: {{ $invoice->created_at->format('d M Y') }}</p>
            <p>Jatuh Tempo: {{ $invoice->due_date?->format('d M Y') ?? '-' }}</p>
            @if($invoice->paid_at)
            <p>Dibayar: {{ $invoice->paid_at->format('d M Y H:i') }}</p>
            @endif
        </div>
        <div class="info-box" style="text-align:right;">
            <h4>Total Tagihan</h4>
            <p class="highlight">Rp {{ number_format($invoice->total_amount, 0, ',', '.') }}</p>
        </div>
    </div>

    {{-- Items Table --}}
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Nama Produk</th>
                <th>SKU</th>
                <th class="center">Qty</th>
                <th class="center">Satuan</th>
                <th class="right">Harga Satuan</th>
                <th class="right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->order->items as $i => $item)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $item->product->name }}</td>
                <td style="color:#6b7280;">{{ $item->product->sku }}</td>
                <td class="center">{{ $item->quantity }}</td>
                <td class="center">{{ $item->product->unit }}</td>
                <td class="right">Rp {{ number_format($item->price, 0, ',', '.') }}</td>
                <td class="right">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    {{-- Totals --}}
    <div class="totals">
        <table>
            <tr>
                <td>Subtotal</td>
                <td class="right">Rp {{ number_format($invoice->total_amount, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td>PPN (0%)</td>
                <td class="right">Rp 0</td>
            </tr>
            <tr class="total-row">
                <td>TOTAL</td>
                <td class="right">Rp {{ number_format($invoice->total_amount, 0, ',', '.') }}</td>
            </tr>
        </table>
    </div>

    {{-- Notes --}}
    @if($invoice->order->notes)
    <div style="margin-top:24px; padding:12px; background:#f9fafb; border-radius:6px; border-left:3px solid #2563eb;">
        <p style="font-size:11px; color:#6b7280; font-weight:700; text-transform:uppercase; margin-bottom:4px;">Catatan</p>
        <p style="font-size:12px;">{{ $invoice->order->notes }}</p>
    </div>
    @endif

    {{-- Footer --}}
    <div class="footer">
        <div>
            <p>Dicetak pada {{ now()->format('d M Y H:i') }}</p>
            <p>OrderLink — Platform Distribusi B2B</p>
        </div>
        <div style="text-align:right;">
            <p>Dokumen ini dibuat secara otomatis oleh sistem.</p>
            <p>Tidak memerlukan tanda tangan.</p>
        </div>
    </div>

</div>
</body>
</html>
