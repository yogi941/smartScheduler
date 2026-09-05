import { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import StatCard from '../../components/common/StatCard';
import {
  departmentsApi,
  coursesApi,
  teachersApi,
  studentBatchesApi,
  roomsApi,
  laboratoriesApi,
} from '../../api/resources';
import { listTimetables } from '../../api/timetable.api';

function DashboardHomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    departments: 0,
    courses: 0,
    teachers: 0,
    batches: 0,
    rooms: 0,
    labs: 0,
    timetables: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [deptRes, courseRes, teacherRes, batchRes, roomRes, labRes, timetableRes] =
          await Promise.allSettled([
            departmentsApi.list({ limit: 1 }),
            coursesApi.list({ limit: 1 }),
            teachersApi.list({ limit: 1 }),
            studentBatchesApi.list({ limit: 1 }),
            roomsApi.list({ limit: 1 }),
            laboratoriesApi.list({ limit: 1 }),
            listTimetables({ limit: 1 }),
          ]);

        setStats({
          departments: deptRes.status === 'fulfilled' ? deptRes.value.meta?.total || 0 : 0,
          courses: courseRes.status === 'fulfilled' ? courseRes.value.meta?.total || 0 : 0,
          teachers: teacherRes.status === 'fulfilled' ? teacherRes.value.meta?.total || 0 : 0,
          batches: batchRes.status === 'fulfilled' ? batchRes.value.meta?.total || 0 : 0,
          rooms: roomRes.status === 'fulfilled' ? roomRes.value.meta?.total || 0 : 0,
          labs: labRes.status === 'fulfilled' ? labRes.value.meta?.total || 0 : 0,
          timetables: timetableRes.status === 'fulfilled' ? timetableRes.value.meta?.total || 0 : 0,
        });
      } catch (err) {
        // quiet fallback
      }
    }

    loadStats();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Graph-Based Automated Timetable Optimization System
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Timetables" value={stats.timetables} icon="📅" description="Generated schedule versions" />
        <StatCard title="Teachers" value={stats.teachers} icon="👨‍🏫" description="Faculty members" />
        <StatCard title="Student Batches" value={stats.batches} icon="👥" description="Enrolled class sections" />
        <StatCard title="Departments" value={stats.departments} icon="🏢" description="Academic departments" />
        <StatCard title="Courses" value={stats.courses} icon="🎓" description="Degree programs" />
        <StatCard title="Classrooms" value={stats.rooms} icon="🚪" description="Lecture halls" />
        <StatCard title="Laboratories" value={stats.labs} icon="🔬" description="Practical labs" />
        <StatCard title="Logged In Role" value={user?.role} icon="👤" description="Current permission level" />
      </div>
    </div>
  );
}

export default DashboardHomePage;
