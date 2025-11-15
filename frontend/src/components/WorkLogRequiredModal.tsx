import React, { useState } from 'react';
import { CreateWorkLogData, WorkLogStatus, WorkLog } from '../types';
import ConfirmDialog from './ConfirmDialog';

interface WorkLogRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWorkLogData) => Promise<void>;
  onForceCheckout: () => void;
  details: {
    title: string;
    description: string;
    checkInTime: string;
    currentTime: string;
    lastWorkLogUpdate?: string;
    timeSinceLastUpdate?: number;
    potentialWorkHours: number;
    reducedWorkHours: number;
    workLogs: WorkLog[];
    latestWorkLog: WorkLog | null;
  };
}

const WorkLogRequiredModal: React.FC<WorkLogRequiredModalProps> = ({
  isOpen,
  onSubmit,
  onForceCheckout,
  details,
}) => {
  const [loading, setLoading] = useState(false);
  const [showForceCheckoutConfirm, setShowForceCheckoutConfirm] = useState(false);

  if (!isOpen) return null;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: CreateWorkLogData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      hoursSpent: parseFloat(formData.get('hoursSpent') as string) || undefined,
      status: (formData.get('status') as WorkLogStatus) || 'IN_PROGRESS',
    };

    try {
      await onSubmit(data);
      e.currentTarget.reset();
    } catch (error) {
      console.error('Error submitting work log:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForceCheckout = () => {
    setShowForceCheckoutConfirm(true);
  };

  const confirmForceCheckout = () => {
    setShowForceCheckoutConfirm(false);
    onForceCheckout();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-6 text-white sticky top-0 z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">{details.title}</h3>
              <p className="text-red-100 text-sm leading-relaxed whitespace-pre-line">
                {details.description}
              </p>
            </div>
          </div>
        </div>

        {/* Warning Info */}
        <div className="px-6 py-6 bg-red-50 border-b-2 border-red-200 space-y-4">
          {/* Time Info */}
          <div className="bg-white border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
            <h4 className="font-bold text-red-900 mb-3 text-lg flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Thông tin thời gian làm việc
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-slate-600">⏰ Thời gian check-in:</span>
                <span className="font-semibold text-slate-900">{formatTime(details.checkInTime)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-slate-600">🕐 Thời gian hiện tại:</span>
                <span className="font-semibold text-slate-900">{formatTime(details.currentTime)}</span>
              </div>
              {details.lastWorkLogUpdate && (
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600">📝 Cập nhật work log cuối:</span>
                  <span className="font-semibold text-orange-600">{formatTime(details.lastWorkLogUpdate)}</span>
                </div>
              )}
              {details.timeSinceLastUpdate && (
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-slate-600">⏱️ Thời gian chưa cập nhật:</span>
                  <span className="font-bold text-red-600">{details.timeSinceLastUpdate} phút</span>
                </div>
              )}
              <div className="flex justify-between items-center py-3 bg-green-50 px-3 rounded-lg mt-3">
                <span className="text-slate-700 font-medium">✅ Nếu cập nhật ngay:</span>
                <span className="font-bold text-green-600 text-xl">{formatHours(details.potentialWorkHours)}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-red-50 px-3 rounded-lg">
                <span className="text-slate-700 font-medium">⚠️ Nếu KHÔNG cập nhật:</span>
                <span className="font-bold text-red-600 text-xl">{formatHours(details.reducedWorkHours)}</span>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-gradient-to-r from-red-100 to-orange-100 border-2 border-red-400 p-5 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-red-900 font-bold mb-2 text-lg">⚠️ QUAN TRỌNG:</p>
                <p className="text-red-800 leading-relaxed text-sm">
                  Để được tính <span className="font-bold underline">đầy đủ thời gian làm việc</span>, 
                  vui lòng <span className="font-bold">cập nhật hoặc thêm công việc</span> bạn đã làm trong thời gian vừa qua. 
                  Nếu không cập nhật, bạn sẽ mất <span className="font-bold text-red-600">
                    {formatHours(details.potentialWorkHours - details.reducedWorkHours)}
                  </span> không được tính vào thời gian làm việc!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Work Log Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
          <div className="border-b-2 border-red-200 pb-3 mb-4">
            <h4 className="font-bold text-slate-900 text-xl flex items-center gap-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {details.workLogs.length > 0 ? 'Thêm hoặc cập nhật công việc' : 'Thêm công việc đã làm'}
            </h4>
            <p className="text-sm text-slate-600 mt-2">
              Điền thông tin công việc bạn đã thực hiện để được ghi nhận thời gian làm việc
            </p>
          </div>

          {/* Show existing work logs if any */}
          {details.workLogs.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h5 className="font-semibold text-blue-900 mb-2 text-sm">Công việc đã cập nhật hôm nay:</h5>
              <div className="space-y-2">
                {details.workLogs.map((log) => (
                  <div key={log.id} className="bg-white p-3 rounded border border-blue-200 text-sm">
                    <div className="font-medium text-slate-900">{log.title}</div>
                    <div className="text-xs text-slate-600 mt-1">
                      Cập nhật lúc: {formatTime(log.updatedAt)} 
                      {log.hoursSpent && ` • ${formatHours(log.hoursSpent)}`}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-700 mt-2">
                💡 Bạn có thể thêm công việc mới hoặc cập nhật công việc hiện có ở form bên dưới
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tiêu đề công việc <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
              placeholder="VD: Hoàn thành báo cáo tháng, Fix bug module auth, Meeting với team..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={4}
              className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
              placeholder="Mô tả chi tiết những gì bạn đã làm, kết quả đạt được..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Số giờ đã làm <span className="text-slate-500 text-xs">(Đề xuất: {formatHours(details.potentialWorkHours)})</span>
              </label>
              <input
                type="number"
                name="hoursSpent"
                step="0.1"
                min="0"
                defaultValue={details.potentialWorkHours.toFixed(1)}
                className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base font-semibold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Trạng thái công việc <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                required
                className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base font-semibold"
                defaultValue="IN_PROGRESS"
              >
                <option value="IN_PROGRESS">⚡ Đang làm</option>
                <option value="COMPLETED">✓ Hoàn thành</option>
              </select>
              <p className="text-xs text-slate-600 mt-1">
                💡 Chỉ chọn công việc đã thực hiện
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t-2 border-slate-200">
            <button
              type="button"
              onClick={handleForceCheckout}
              className="flex-1 px-6 py-3 border-2 border-slate-400 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
            >
              Bỏ qua & Check-out <br/>
              <span className="text-xs text-red-600">(Mất {formatHours(details.potentialWorkHours - details.reducedWorkHours)})</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-orange-700 transition-all disabled:opacity-50 shadow-lg text-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-2">Đang xử lý...</span>
                </>
              ) : (
                '✓ Cập nhật & Check-out'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Force Checkout Confirmation */}
      <ConfirmDialog
        isOpen={showForceCheckoutConfirm}
        title="⚠️ Xác nhận bỏ qua"
        message={`Bạn có chắc muốn check-out mà không cập nhật công việc?\n\nBạn sẽ mất ${formatHours(details.potentialWorkHours - details.reducedWorkHours)} không được tính vào thời gian làm việc!`}
        confirmText="Vẫn check-out"
        cancelText="Hủy"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        onConfirm={confirmForceCheckout}
        onCancel={() => setShowForceCheckoutConfirm(false)}
      />
    </div>
  );
};

export default WorkLogRequiredModal;

