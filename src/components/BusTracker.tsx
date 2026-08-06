import React, { useState, useEffect, useCallback } from 'react';
import { BusRoute, CampusType } from '../types';
import { Bus, RefreshCw, MapPin, AlertCircle, Info, ChevronRight, Radio } from 'lucide-react';
import { fetchLiveBusArrival, LiveBusArrival } from '../data/liveBus';

interface BusTrackerProps {
  campus: CampusType;
  busRoutes: BusRoute[];
  setBusRoutes: React.Dispatch<React.SetStateAction<BusRoute[]>>;
}

export const BusTracker: React.FC<BusTrackerProps> = ({ campus, busRoutes, setBusRoutes }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45);
  // 서울시 버스도착정보 API로 실제 조회에 성공한 노선만 여기 채워진다. (id -> 실시간 도착정보)
  const [liveArrivals, setLiveArrivals] = useState<Record<string, LiveBusArrival>>({});

  // seoulBusStop이 설정된 노선만 실시간 API를 조회한다. 실패/미설정 노선은
  // 기존 시뮬레이션 값(route.nextArrivalMinutes)을 그대로 보여준다.
  const refreshLiveArrivals = useCallback(async () => {
    const trackedRoutes = busRoutes.filter((r) => r.seoulBusStop);
    if (trackedRoutes.length === 0) return;

    const results = await Promise.all(
      trackedRoutes.map(async (r) => {
        const live = await fetchLiveBusArrival(r.seoulBusStop!);
        return [r.id, live] as const;
      })
    );

    setLiveArrivals((prev) => {
      const next = { ...prev };
      for (const [id, live] of results) {
        if (live) next[id] = live;
      }
      return next;
    });
  }, [busRoutes]);

  // Live countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // 실시간 API가 연동된 노선을 우선 갱신하고,
          void refreshLiveArrivals();
          // 그 외(셔틀버스 등 공공API가 없는 노선)는 기존처럼 시뮬레이션한다.
          setBusRoutes((prevRoutes) =>
            prevRoutes.map((r) => {
              if (r.seoulBusStop) return r;
              const newArrival = Math.max(1, (r.nextArrivalMinutes + Math.floor(Math.random() * 3) - 1));
              return { ...r, nextArrivalMinutes: newArrival };
            })
          );
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [setBusRoutes, refreshLiveArrivals]);

  // 최초 진입 시에도 한 번 실시간 데이터를 가져온다.
  useEffect(() => {
    void refreshLiveArrivals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRoutes = busRoutes.filter((r) => {
    if (r.campus !== campus) return false;
    if (filterType === 'city') return r.routeType === 'city' || r.routeType === 'express';
    return true;
  });

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    void refreshLiveArrivals();
    setTimeout(() => {
      setBusRoutes((prev) =>
        prev.map((r) => {
          if (r.seoulBusStop) return r; // 실시간 노선은 refreshLiveArrivals가 담당
          return {
            ...r,
            nextArrivalMinutes: Math.floor(Math.random() * 8) + 1,
            stopsAway: Math.floor(Math.random() * 3) + 1,
          };
        })
      );
      setSecondsRemaining(60);
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Bus className="w-5 h-5 text-[#0577B2]" />
            <span>명지전문대 버스 도착정보</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            시내/직행 버스 정류장 실시간 카운트다운 (다음 갱신 {secondsRemaining}초 후)
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="px-3.5 py-2 bg-[#0A174C] hover:bg-[#0577B2] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>새로고침</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            filterType === 'all'
              ? 'bg-[#0A174C] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          전체 노선 ({busRoutes.filter((r) => r.campus === campus).length})
        </button>
        <button
          onClick={() => setFilterType('city')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            filterType === 'city'
              ? 'bg-[#0A174C] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          시내/직행 버스
        </button>
      </div>

      {/* Bus Routes List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredRoutes.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-6">
            <Bus className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-slate-600 font-bold text-sm">해당 노선의 버스 정보가 없습니다.</p>
          </div>
        ) : (
          filteredRoutes.map((route) => {
            const isShuttle = route.routeType === 'shuttle';
            const live = route.seoulBusStop ? liveArrivals[route.id] : undefined;
            const crowdednessColor =
              route.crowdedness === '여유'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : route.crowdedness === '보통'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200';

            return (
              <div
                key={route.id}
                onClick={() => setSelectedRoute(route)}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-[#0577B2] transition-all cursor-pointer group hover:shadow-md relative"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                        isShuttle ? 'bg-[#0577B2] text-white' : 'bg-[#0A174C] text-white'
                      }`}
                    >
                      {isShuttle ? '셔틀' : '버스'}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-[#0577B2] transition-colors">
                        {route.busNumber}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{route.destination}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${crowdednessColor}`}
                  >
                    {route.crowdedness}
                  </span>
                </div>

                {/* Countdown Box */}
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                      도착 예정 시간
                      {live && (
                        <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold">
                          <Radio className="w-2.5 h-2.5" />
                          실시간
                        </span>
                      )}
                    </span>
                    {live ? (
                      live.minutes !== null ? (
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-xl font-black text-[#0577B2]">
                            {live.minutes}분 후
                          </span>
                          {live.stopsAway !== null && (
                            <span className="text-xs font-semibold text-slate-600">
                              ({live.stopsAway}번째 전)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm font-black text-[#0577B2] mt-0.5 block">
                          {live.message}
                        </span>
                      )
                    ) : (
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xl font-black text-[#0577B2]">
                          {route.nextArrivalMinutes}분 후
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          ({route.stopsAway}정거장 전)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 font-semibold block">
                      운행 시간
                    </span>
                    <span className="text-xs font-bold text-slate-700">{route.operatingHours}</span>
                  </div>
                </div>

                {/* Route Station Preview bar */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-medium pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1 truncate max-w-[80%]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{route.stops.join(' ➔ ')}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Route Station Modal */}
      {selectedRoute && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#0577B2]/10 text-[#0577B2] font-black text-sm">
                  {selectedRoute.routeType === 'shuttle' ? '셔틀노선' : '일반노선'}
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg">{selectedRoute.busNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedRoute(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500">정류장 운행 노선도</p>
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                {selectedRoute.stops.map((stop, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 ${
                          index === 0
                            ? 'bg-[#0577B2] border-white ring-2 ring-sky-300'
                            : 'bg-white border-slate-400'
                        }`}
                      />
                      {index < selectedRoute.stops.length - 1 && (
                        <div className="w-0.5 h-6 bg-slate-300 my-0.5" />
                      )}
                    </div>
                    <span
                      className={`text-xs ${
                        index === 0 ? 'font-bold text-[#0A174C]' : 'font-medium text-slate-700'
                      }`}
                    >
                      {stop} {index === 0 && '(기점/승차장)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 flex items-start gap-2 text-xs text-sky-900">
              <Info className="w-4 h-4 text-[#0577B2] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">이용 안내:</span> 도로 사정 및 기상 상황에 따라 실시간 도착 오차가 발생할 수 있습니다.
              </div>
            </div>

            <button
              onClick={() => setSelectedRoute(null)}
              className="w-full py-2.5 bg-[#0A174C] text-white rounded-xl text-sm font-bold hover:bg-[#0577B2] transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
