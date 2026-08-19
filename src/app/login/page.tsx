import { authenticate } from "@/lib/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || "/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Cổng đào tạo nội bộ
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Đăng nhập để bắt đầu học và làm bài đánh giá.
        </p>

        {params.error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            Email hoặc mật khẩu không đúng.
          </p>
        )}

        <form action={authenticate} className="mt-6 space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="ban@congty.vn"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Đăng nhập
          </button>
        </form>

        <div className="mt-6 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
          <p className="font-medium text-slate-600">Tài khoản demo:</p>
          <p>Quản trị viên: admin@congty.vn / admin123</p>
          <p>Nhân viên: nhanvien@congty.vn / nhanvien123</p>
        </div>
      </div>
    </div>
  );
}
