import React, { useState } from 'react';
import { ClassItem } from '../types';
import { Calendar, Plus, Clock, MapPin, User, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

interface ScheduleCalendarProps {
  classes: ClassItem[];
  setClasses: React.Dispatch<React.SetStateAction<ClassItem[]>>;
  onShowToast: (msg: string) => void;
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  classes,
  setClasses,
  onShowToast,
}) => {
  const [viewMode, setViewMode] = useState<'timetable' | 'monthly'>('timetable');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New Class Form State
  const [className, setClassName] = useState<string>('');
  const [professor, setProfessor] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [dayOfWeek, setDayOfWeek] = useState<ClassItem['dayOfWeek']>('월');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:30');
  const [color, setColor] = useState<string>('#0577B2');

  const days: ClassItem['dayOfWeek'][] = ['월', '화', '수', '목', '금'];
  const times = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30'];

  const colorOptions = ['#0577B2', '#0A174C', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    const newClass: ClassItem = {
      id: `cls_${Date.now()}`,
      name: className.trim(),
      professor: professor.trim() || '담당 교수',
      room: room.trim() || '강의실 미정',
      dayOfWeek,
      startTime,
      endTime,
      color,
    };

    setClasses([...classes, newClass]);
    setIsAddModalOpen(false);
    setClassName('');
    setProfessor('');
    setRoom('');
    onShowToast(`📅 "${newClass.name}" 강의가 시간표에 추가되었습니다!`);
  };

  const handleDeleteClass = (id: string, name: string) => {
    setClasses(classes.filter((c) => c.id !== id));
    onShowToast(`"${name}" 강의가 삭제되었습니다.`);
  };

  return (
    <div className="space-y-4">
      {/* Header & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0577B2]" />
            <span>학교 강의 일정 (캘린더)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            2026학년도 수강 과목 시간표 및 강의실 일정 관리
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl text-xs font-bold border border-slate-200">
            <button
              onClick={() => setViewMode('timetable')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'timetable'
                  ? 'bg-[#0A174C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              주간 시간표
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'monthly'
                  ? 'bg-[#0A174C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              월간 캘린더
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-2 bg-[#0577B2] text-white rounded-xl text-xs font-bold hover:bg-[#0A174C] transition-colors flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>강의 추가</span>
          </button>
        </div>
      </div>

      {/* View Mode: Weekly Timetable Grid */}
      {viewMode === 'timetable' ? (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header Row Days */}
            <div className="grid grid-cols-6 gap-2 pb-2 border-b border-slate-200 text-center font-extrabold text-xs text-slate-700">
              <div className="py-2 text-slate-400">시간</div>
              {days.map((day) => (
                <div
                  key={day}
                  className="py-2 bg-slate-50 rounded-xl border border-slate-100 text-[#0A174C]"
                >
                  {day}요일
                </div>
              ))}
            </div>

            {/* Timetable Rows */}
            <div className="divide-y divide-slate-100 mt-2">
              {times.map((timeSlot) => (
                <div key={timeSlot} className="grid grid-cols-6 gap-2 py-2 min-h-[70px]">
                  {/* Time label */}
                  <div className="text-[11px] font-bold text-slate-400 flex items-center justify-center">
                    {timeSlot}
                  </div>

                  {/* Day Slots */}
                  {days.map((day) => {
                    const matchedClass = classes.find(
                      (c) => c.dayOfWeek === day && c.startTime <= timeSlot && c.endTime > timeSlot
                    );

                    if (matchedClass) {
                      return (
                        <div
                          key={day}
                          style={{ backgroundColor: `${matchedClass.color}15`, borderColor: matchedClass.color }}
                          className="p-2.5 rounded-xl border-l-4 shadow-xs relative group flex flex-col justify-between"
                        >
                          <div>
                            <span
                              style={{ color: matchedClass.color }}
                              className="font-black text-xs block leading-tight truncate"
                            >
                              {matchedClass.name}
                            </span>
                            <span className="text-[10px] text-slate-600 block mt-0.5 truncate">
                              {matchedClass.professor}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mt-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{matchedClass.room}</span>
                          </div>

                          <button
                            onClick={() => handleDeleteClass(matchedClass.id, matchedClass.name)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 font-bold text-xs p-1"
                            title="삭제"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={day}
                        className="bg-slate-50/50 rounded-xl border border-dashed border-slate-200/60 hover:bg-slate-100/50 transition-colors"
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* View Mode: Monthly Calendar View Design */
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base">2026년 8월 강의 Calendar</h3>
            <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#0577B2]" /> 수강 강의 등록 완료 ({classes.length}개)
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 pb-2 border-b border-slate-100">
            <div className="text-rose-500">일</div>
            <div>월</div>
            <div>화</div>
            <div>수</div>
            <div>목</div>
            <div>금</div>
            <div className="text-sky-600">토</div>
          </div>

          {/* Calendar Grid Days */}
          <div className="grid grid-cols-7 gap-1.5 text-xs">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNum) => {
              const dayIndex = (dayNum + 5) % 7; // offset for 2026 August start
              const dayName = ['일', '월', '화', '수', '목', '금', '토'][dayIndex];
              const dayClasses = classes.filter((c) => c.dayOfWeek === dayName);

              return (
                <div
                  key={dayNum}
                  className={`min-h-[75px] p-1.5 rounded-xl border transition-all ${
                    dayNum === 6
                      ? 'bg-sky-50/80 border-[#0577B2] font-black'
                      : 'bg-slate-50/50 border-slate-200/70 hover:bg-white'
                  }`}
                >
                  <span
                    className={`font-bold block ${
                      dayIndex === 0
                        ? 'text-rose-500'
                        : dayIndex === 6
                        ? 'text-sky-600'
                        : 'text-slate-800'
                    }`}
                  >
                    {dayNum} {dayNum === 6 && <span className="text-[9px] font-bold text-[#0577B2]">(오늘)</span>}
                  </span>

                  <div className="mt-1 space-y-1">
                    {dayClasses.map((cls) => (
                      <div
                        key={cls.id}
                        style={{ backgroundColor: cls.color }}
                        className="text-white text-[9px] font-bold p-1 rounded-md truncate shadow-xs"
                      >
                        {cls.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">새 수강 강의 추가</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddClass} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">과목명 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 모바일 앱 개발"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">담당 교수님</label>
                  <input
                    type="text"
                    placeholder="예: 김명지 교수님"
                    value={professor}
                    onChange={(e) => setProfessor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">강의실</label>
                  <input
                    type="text"
                    placeholder="예: 경상관 405호"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">강의 요일</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value as ClassItem['dayOfWeek'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}요일
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">시작 시간</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">종료 시간</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">카드 테마 색상</label>
                <div className="flex items-center gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        color === c ? 'border-slate-900 scale-110' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A174C] text-white font-bold rounded-xl hover:bg-[#0577B2] transition-colors"
                >
                  시간표 추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
