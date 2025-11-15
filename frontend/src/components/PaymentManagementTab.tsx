import React, { useState, useEffect } from 'react';
import { paymentAPI, employeeAPI } from '../services/api';
import { Employee, SalaryType } from '../types';
import { useToast } from '../context/ToastContext';

const PaymentManagementTab: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [earnings, setEarnings] = useState<any>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [earningsRes, employeesRes] = await Promise.all([
        paymentAPI.calculate({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }),
        employeeAPI.getAll(),
      ]);
      setEarnings(earningsRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSalarySettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const formData = new FormData(e.currentTarget);
    const salaryType = formData.get('salaryType') as SalaryType;

    try {
      await employeeAPI.update(editingEmployee.id, {
        salaryType,
        salary: salaryType === 'MONTHLY' ? parseFloat(formData.get('salary') as string) : editingEmployee.salary,
        hourlyRate: salaryType === 'HOURLY' ? parseFloat(formData.get('hourlyRate') as string) : editingEmployee.hourlyRate,
      });

      showSuccess('Cập nhật cài đặt lương thành công!');
      setShowEditModal(false);
      setEditingEmployee(null);
      await loadData();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Lỗi khi cập nhật');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-lg text-slate-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Summary */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-4">💰 Quản lý Công & Lương</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-green-100 mb-1">Tổng nhân viên</div>
            <div className="text-3xl font-bold">{earnings?.summary.totalEmployees || 0}</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-green-100 mb-1">Tổng công</div>
            <div className="text-2xl font-bold">{formatCurrency(earnings?.summary.totalEarnings || 0)}</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-green-100 mb-1">Tổng giờ làm</div>
            <div className="text-3xl font-bold">{earnings?.summary.totalHours || 0}h</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-green-100 mb-1">TB/nhân viên</div>
            <div className="text-2xl font-bold">
              {formatCurrency(earnings?.summary.averageEarningsPerEmployee || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Khoảng thời gian tính công</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Từ ngày</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Đến ngày</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200/50">
          <h3 className="text-lg font-medium text-slate-900">Bảng tính công</h3>
          <p className="text-sm text-slate-500 mt-1">Danh sách nhân viên và công được tính</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/50">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">
                  Họ tên
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">
                  Chức vụ
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase">
                  Loại lương
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase">
                  Đơn giá
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase">
                  Giờ làm
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase">
                  Tổng công
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-slate-200/50">
              {earnings?.employees.map((emp: any, index: number) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {index < 3 && (
                        <span className="text-xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      )}
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-xs text-slate-500">{emp.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{emp.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 inline-flex text-xs font-medium rounded-full ${
                        emp.salaryType === 'HOURLY'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {emp.salaryType === 'HOURLY' ? '⏱️ Theo giờ' : '📅 Theo tháng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-slate-900">
                      {emp.salaryType === 'HOURLY'
                        ? formatCurrency(emp.hourlyRate || 0) + '/h'
                        : formatCurrency(emp.monthlySalary || 0) + '/tháng'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-slate-900">{emp.totalHours}h</div>
                    <div className="text-xs text-slate-500">{emp.attendanceDays} ngày</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(emp.earnings)}
                    </div>
                    <div className="text-xs text-slate-500">{emp.calculationMethod}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => {
                        const fullEmployee = employees.find((e) => e.id === emp.id);
                        if (fullEmployee) {
                          setEditingEmployee(fullEmployee);
                          setShowEditModal(true);
                        }
                      }}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Cài đặt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Salary Settings Modal */}
      {showEditModal && editingEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-green-600 to-emerald-600">
              <h3 className="text-xl font-semibold text-white">
                Cài đặt lương: {editingEmployee.firstName} {editingEmployee.lastName}
              </h3>
            </div>

            <form onSubmit={handleUpdateSalarySettings} className="p-6 space-y-5">
              {/* Salary Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Loại tính lương <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-blue-500">
                    <input
                      type="radio"
                      name="salaryType"
                      value="HOURLY"
                      defaultChecked={editingEmployee.salaryType === 'HOURLY'}
                      className="w-5 h-5 text-blue-600"
                    />
                    <div className="ml-4">
                      <div className="font-semibold text-slate-900">⏱️ Theo giờ</div>
                      <div className="text-xs text-slate-500">Tổng giờ × Đơn giá giờ = Tổng công</div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-purple-500">
                    <input
                      type="radio"
                      name="salaryType"
                      value="MONTHLY"
                      defaultChecked={editingEmployee.salaryType === 'MONTHLY' || !editingEmployee.salaryType}
                      className="w-5 h-5 text-purple-600"
                    />
                    <div className="ml-4">
                      <div className="font-semibold text-slate-900">📅 Theo tháng</div>
                      <div className="text-xs text-slate-500">Lương cố định hàng tháng</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Hourly Rate Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Đơn giá giờ (VND/giờ)
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  step="1000"
                  min="0"
                  defaultValue={editingEmployee.hourlyRate || 50000}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: 50000"
                />
                <p className="text-xs text-slate-500 mt-1">
                  💡 Áp dụng khi chọn "Theo giờ"
                </p>
              </div>

              {/* Monthly Salary Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Lương tháng (VND)
                </label>
                <input
                  type="number"
                  name="salary"
                  step="100000"
                  min="0"
                  defaultValue={editingEmployee.salary || 10000000}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: 10000000"
                />
                <p className="text-xs text-slate-500 mt-1">
                  💡 Áp dụng khi chọn "Theo tháng"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEmployee(null);
                  }}
                  className="flex-1 px-4 py-2.5 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 shadow-lg"
                >
                  Lưu cài đặt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagementTab;

