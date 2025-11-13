import React from 'react';
import { useAuth } from '../context/AuthContext';

const EmployeeDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const employee = user?.employee;

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      {/* Header - Modern & Minimal */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-light text-slate-900">
                Dashboard <span className="font-medium text-emerald-600">Nhân Viên</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">Thông tin cá nhân của bạn</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-700">
                  {employee?.firstName} {employee?.lastName}
                </p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900
                         border border-slate-300 rounded-lg hover:bg-slate-50 transition-all duration-200"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white shadow-lg">
          <h2 className="text-3xl font-light mb-2">
            Xin chào, {employee?.firstName}!
          </h2>
          <p className="text-emerald-50">Chúc bạn một ngày làm việc hiệu quả</p>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-slate-900">Chức vụ & Phòng ban</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Chức vụ</p>
                <p className="text-lg text-slate-900 font-medium">{employee?.position}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Phòng ban</p>
                <p className="text-lg text-slate-900 font-medium">{employee?.department}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-slate-900">Thu nhập & Ngày vào làm</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Lương</p>
                <p className="text-lg text-emerald-600 font-semibold">
                  {formatCurrency(employee?.salary)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Ngày vào làm</p>
                <p className="text-lg text-slate-900 font-medium">
                  {formatDate(employee?.hireDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Info Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200/50">
            <h2 className="text-lg font-medium text-slate-900">Thông tin cá nhân</h2>
            <p className="text-sm text-slate-500 mt-1">Thông tin chi tiết về hồ sơ của bạn</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Họ và tên
                </label>
                <p className="text-base text-slate-900 font-medium">
                  {employee?.firstName} {employee?.lastName}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Email
                </label>
                <p className="text-base text-slate-900 font-medium">{user?.email}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Số điện thoại
                </label>
                <p className="text-base text-slate-900 font-medium">
                  {employee?.phone || 'Chưa cập nhật'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  Địa chỉ
                </label>
                <p className="text-base text-slate-900 font-medium">
                  {employee?.address || 'Chưa cập nhật'}
                </p>
              </div>
            </div>

            {/* Info Notice */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Cần cập nhật thông tin?
                    </p>
                    <p className="text-sm text-blue-700">
                      Vui lòng liên hệ với bộ phận Nhân sự hoặc Admin để cập nhật thông tin cá nhân của bạn.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
