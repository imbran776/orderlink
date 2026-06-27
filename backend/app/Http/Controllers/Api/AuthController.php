<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            'role' => 'required|in:retailer,driver',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'company_name' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'company_name' => $validated['company_name'] ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil',
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (! Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        if (! $user->is_active) {
            return response()->json(['message' => 'Akun Anda tidak aktif. Hubungi admin.'], 403);
        }

        // Jika login dari cron/service, hapus hanya token cron lama (jangan ganggu session user lain)
        if ($request->boolean('cron')) {
            $user->tokens()->where('name', 'cron_token')->delete();
            $token = $user->createToken('cron_token')->plainTextToken;
        } else {
            $user->tokens()->delete();
            $token = $user->createToken('auth_token')->plainTextToken;
        }

        return response()->json([
            'message' => 'Login berhasil',
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil']);
    }

    public function profile(Request $request)
    {
        return response()->json(['user' => new UserResource($request->user())]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
            'address' => 'sometimes|nullable|string',
            'company_name' => 'sometimes|nullable|string|max:255',
            'password' => 'sometimes|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
        ]);

        // Jika email ada di request, validasi unik (abaikan user sendiri)
        if ($request->has('email') && $request->email !== $user->email) {
            $request->validate([
                'email' => 'required|email|unique:users,email,'.$user->id,
            ]);
            $validated['email'] = $request->email;
        }

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user' => new UserResource($user),
        ]);
    }

    public function drivers()
    {
        $drivers = User::where('role', 'driver')
            ->where('is_active', true)
            ->get();

        return response()->json(['data' => UserResource::collection($drivers)]);
    }
}
