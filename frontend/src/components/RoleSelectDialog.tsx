import React, { useState } from 'react';

interface RoleSelectDialogProps {
  isOpen: boolean;
  currentRole: string;
  onConfirm: (role: string) => void;
  onCancel: () => void;
}

const RoleSelectDialog: React.FC<RoleSelectDialogProps> = ({
  isOpen,
  currentRole,
  onConfirm,
  onCancel,
}) => {
  const [selectedRole, setSelectedRole] = useState(currentRole);

  if (!isOpen) return null;

  const roles = [
    { value: 'EMPLOYEE', label: 'Nhân viên', icon: '👤', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    { value: 'MANAGER', label: 'Quản lý', icon: '👔', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { value: 'ADMIN', label: 'Quản trị viên', icon: '👑', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  ];

  const handleConfirm = () => {
    onConfirm(selectedRole);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-purple-600">
          <h3 className="text-xl font-semibold text-white">Thay đổi vai trò</h3>
          <p className="text-indigo-100 text-sm mt-1">Chọn vai trò mới cho nhân viên</p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="space-y-3">
            {roles.map((role) => (
              <label
                key={role.value}
                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                  selectedRole === role.value
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={selectedRole === role.value}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-5 h-5 text-indigo-600"
                />
                <div className="ml-4 flex items-center gap-3 flex-1">
                  <span className="text-3xl">{role.icon}</span>
                  <div>
                    <div className="font-semibold text-slate-900">{role.label}</div>
                    <div className="text-xs text-slate-500">{role.value}</div>
                  </div>
                </div>
                {selectedRole === role.value && (
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
          >
            Cập nhật vai trò
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectDialog;

