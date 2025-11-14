import { useState, useEffect } from 'react';
import { teamAPI, employeeAPI } from '../services/api';
import { Team, Employee } from '../types';
import { useToast } from '../context/ToastContext';

export default function TeamManagementTab() {
  const { showSuccess, showError } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teamsRes, employeesRes] = await Promise.all([
        teamAPI.getAll(),
        employeeAPI.getAll(),
      ]);
      setTeams(teamsRes.data.teams);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await teamAPI.create({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        managerId: (formData.get('managerId') as string) || undefined,
      });

      setShowCreateModal(false);
      showSuccess('Tạo nhóm thành công!');
      await loadData();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Lỗi khi tạo nhóm');
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTeam) return;

    const formData = new FormData(e.currentTarget);

    try {
      await teamAPI.update(selectedTeam.id, {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        managerId: (formData.get('managerId') as string) || undefined,
      });

      setShowEditModal(false);
      setSelectedTeam(null);
      showSuccess('Cập nhật nhóm thành công!');
      await loadData();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Lỗi khi cập nhật nhóm');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Bạn có chắc muốn xóa nhóm này?')) return;

    try {
      await teamAPI.delete(teamId);
      showSuccess('Xóa nhóm thành công!');
      await loadData();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Lỗi khi xóa nhóm');
    }
  };

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTeam) return;

    const formData = new FormData(e.currentTarget);
    const employeeId = formData.get('employeeId') as string;

    try {
      await teamAPI.addMember(selectedTeam.id, employeeId);
      setShowAddMemberModal(false);
      setSelectedTeam(null);
      showSuccess('Thêm thành viên thành công!');
      await loadData();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Lỗi khi thêm thành viên');
    }
  };

  const handleRemoveMember = async (employeeId: string) => {
    if (!confirm('Bạn có chắc muốn xóa thành viên này khỏi nhóm?')) return;

    try {
      await teamAPI.removeMember(employeeId);
      showSuccess('Xóa thành viên thành công!');
      await loadData();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Lỗi khi xóa thành viên');
    }
  };

  const handleChangeRole = async (employeeId: string, currentRole: string) => {
    const roles = ['EMPLOYEE', 'MANAGER', 'ADMIN'];
    const roleLabels = {
      EMPLOYEE: 'Nhân viên',
      MANAGER: 'Quản lý',
      ADMIN: 'Quản trị viên',
    };

    const newRole = prompt(
      `Chọn vai trò mới:\n1. ${roleLabels.EMPLOYEE}\n2. ${roleLabels.MANAGER}\n3. ${roleLabels.ADMIN}\n\nNhập số (1-3):`,
      currentRole === 'EMPLOYEE' ? '1' : currentRole === 'MANAGER' ? '2' : '3'
    );

    if (!newRole || !['1', '2', '3'].includes(newRole)) return;

    const selectedRole = roles[parseInt(newRole) - 1];

    try {
      await employeeAPI.updateRole(employeeId, { role: selectedRole as any });
      showSuccess(`Đã cập nhật vai trò thành ${roleLabels[selectedRole as keyof typeof roleLabels]}!`);
      await loadData();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Lỗi khi cập nhật vai trò');
    }
  };

  // Get available employees (not in any team or not managers)
  const getAvailableEmployees = () => {
    return employees.filter((emp) => {
      const isInTeam = teams.some((team) =>
        team.members.some((member) => member.id === emp.id)
      );
      const isManager = teams.some((team) => team.managerId === emp.id);
      return !isInTeam && !isManager;
    });
  };

  if (loading) {
    return <div className="p-6">Đang tải...</div>;
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý nhóm</h2>
            <p className="text-gray-600">{teams.length} nhóm</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Tạo nhóm mới
          </button>
        </div>

        {teams.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Chưa có nhóm nào</p>
        ) : (
          <div className="space-y-6">
            {teams.map((team) => (
              <div key={team.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {team.name}
                    </h3>
                    {team.description && (
                      <p className="text-gray-600 mt-1">{team.description}</p>
                    )}
                    {team.manager && (
                      <p className="text-sm text-blue-600 mt-2">
                        Quản lý: {team.manager.firstName} {team.manager.lastName} ({team.manager.position})
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        setShowAddMemberModal(true);
                      }}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Thêm thành viên
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        setShowEditModal(true);
                      }}
                      className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Thành viên ({team.members.length})
                  </h4>
                  {team.members.length === 0 ? (
                    <p className="text-gray-500 text-sm">Chưa có thành viên</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {team.members.map((member) => {
                        const fullEmployee = employees.find((e) => e.id === member.id);
                        return (
                          <div
                            key={member.id}
                            className="border border-gray-200 rounded p-3 flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {member.position}
                              </p>
                              {fullEmployee?.user && (
                                <p className="text-xs text-gray-500">
                                  Vai trò: {fullEmployee.user.role === 'ADMIN' ? 'Admin' : fullEmployee.user.role === 'MANAGER' ? 'Quản lý' : 'Nhân viên'}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleChangeRole(member.id, fullEmployee?.user?.role || 'EMPLOYEE')}
                                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                              >
                                Đổi role
                              </button>
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Tạo nhóm mới</h3>
            <form onSubmit={handleCreateTeam}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên nhóm
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quản lý
                </label>
                <select
                  name="managerId"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn quản lý</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} - {emp.position}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Tạo nhóm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Sửa nhóm</h3>
            <form onSubmit={handleUpdateTeam}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên nhóm
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedTeam.name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  defaultValue={selectedTeam.description}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quản lý
                </label>
                <select
                  name="managerId"
                  defaultValue={selectedTeam.managerId || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn quản lý</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} - {emp.position}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedTeam(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Thêm thành viên vào {selectedTeam.name}</h3>
            <form onSubmit={handleAddMember}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhân viên
                </label>
                <select
                  name="employeeId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn nhân viên</option>
                  {getAvailableEmployees().map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} - {emp.position}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setSelectedTeam(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
