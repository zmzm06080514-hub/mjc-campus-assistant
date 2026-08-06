import React, { useState } from 'react';
import { FoodSpot, CampusType } from '../types';
import { MapPin, Star, Copy, Plus, Phone, Search, Utensils, Sparkles, Image as ImageIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface FoodSpotMapProps {
  campus: CampusType;
  foodSpots: FoodSpot[];
  setFoodSpots: React.Dispatch<React.SetStateAction<FoodSpot[]>>;
  onShowToast: (msg: string) => void;
}

export const FoodSpotMap: React.FC<FoodSpotMapProps> = ({
  campus,
  foodSpots,
  setFoodSpots,
  onShowToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedSpot, setSelectedSpot] = useState<FoodSpot | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // New Food Spot Form Modal state
  const [isAddingSpot, setIsAddingSpot] = useState<boolean>(false);
  const [newSpotName, setNewSpotName] = useState<string>('');
  const [newSpotCategory, setNewSpotCategory] = useState<FoodSpot['category']>('한식');
  const [newSpotAddress, setNewSpotAddress] = useState<string>('');
  const [newSpotPhone, setNewSpotPhone] = useState<string>('');
  const [newSpotDesc, setNewSpotDesc] = useState<string>('');
  const [newSpotImage1, setNewSpotImage1] = useState<string>('');
  const [newSpotImage2, setNewSpotImage2] = useState<string>('');
  const [newSpotImage3, setNewSpotImage3] = useState<string>('');

  const categories = ['전체', '한식', '양식/일식', '카페/디저트', '분식', '술집/야식'];

  const campusSpots = foodSpots.filter((spot) => spot.campus === campus);

  const filteredSpots = campusSpots.filter((spot) => {
    const matchesCat = selectedCategory === '전체' || spot.category === selectedCategory;
    const matchesSearch =
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    onShowToast(`📍 주소가 복사되었습니다: "${address}"`);
  };

  const handleCreateSpot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpotName.trim() || !newSpotAddress.trim()) {
      onShowToast('상호명과 주소를 입력해주세요.');
      return;
    }

    const images = [
      newSpotImage1.trim() || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      ...(newSpotImage2.trim() ? [newSpotImage2.trim()] : []),
      ...(newSpotImage3.trim() ? [newSpotImage3.trim()] : []),
    ];

    const newSpot: FoodSpot = {
      id: `food_custom_${Date.now()}`,
      campus,
      name: newSpotName.trim(),
      category: newSpotCategory,
      address: newSpotAddress.trim(),
      lat: Math.floor(Math.random() * 60) + 20,
      lng: Math.floor(Math.random() * 60) + 20,
      rating: 5.0,
      phone: newSpotPhone.trim() || '02-300-0000',
      images,
      description: newSpotDesc.trim() || '학생 추천 신규 맛집입니다!',
      popularMenus: [{ name: '대표 메뉴', price: '시가' }],
      reviewsCount: 1,
    };

    setFoodSpots([newSpot, ...foodSpots]);
    setIsAddingSpot(false);
    // Reset form
    setNewSpotName('');
    setNewSpotAddress('');
    setNewSpotPhone('');
    setNewSpotDesc('');
    setNewSpotImage1('');
    setNewSpotImage2('');
    setNewSpotImage3('');

    onShowToast(`🎉 새로운 맛집 핀 "${newSpot.name}"이 추가되었습니다!`);
    setSelectedSpot(newSpot);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#0577B2]" />
            <span>명지전문대 주변 맛집 핀 맵</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-[#0577B2] font-bold">
              {filteredSpots.length}곳
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            지도의 핀을 누르면 사진, 리뷰 및 복사 가능한 주소를 확인할 수 있습니다.
          </p>
        </div>

        <button
          onClick={() => setIsAddingSpot(true)}
          className="px-3.5 py-2 bg-[#0A174C] hover:bg-[#0577B2] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>새 맛집 핀 제보하기</span>
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#0A174C] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="상호명, 메뉴, 주소 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0577B2]"
          />
        </div>
      </div>

      {/* Interactive Custom Map Visual Canvas */}
      <div className="relative w-full h-[320px] sm:h-[380px] bg-slate-100 rounded-2xl border-2 border-slate-200/90 overflow-hidden shadow-inner flex flex-col justify-between">
        {/* Map Styled Background Canvas Mockup */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-85"
          style={{
            backgroundImage: `radial-gradient(#0577b222 1px, transparent 1px), radial-gradient(#0a174c15 1px, #f8fafc 1px)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />

        {/* Campus Map Label overlay */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-extrabold text-[#0A174C] shadow-xs flex items-center gap-1.5 z-10">
          <MapPin className="w-3.5 h-3.5 text-[#0577B2]" />
          <span>명지전문대 주변</span>
        </div>

        {/* Pin Markers Dropped on Map */}
        <div className="absolute inset-0 p-8 z-20">
          {filteredSpots.map((spot) => {
            const isSelected = selectedSpot?.id === spot.id;
            return (
              <div
                key={spot.id}
                style={{ top: `${spot.lat}%`, left: `${spot.lng}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform hover:scale-110 z-20"
                onClick={() => {
                  setSelectedSpot(spot);
                  setActiveImageIndex(0);
                }}
              >
                {/* Pin Tooltip */}
                <div
                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shadow-md whitespace-nowrap mb-1 transition-all border ${
                    isSelected
                      ? 'bg-[#0A174C] text-white border-white ring-2 ring-sky-300'
                      : 'bg-white text-slate-800 border-slate-200 group-hover:bg-[#0577B2] group-hover:text-white'
                  }`}
                >
                  {spot.name} ⭐{spot.rating}
                </div>

                {/* Pin Marker Icon */}
                <div
                  className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center shadow-lg transition-transform ${
                    isSelected
                      ? 'bg-[#0577B2] text-white ring-4 ring-sky-300 scale-125'
                      : 'bg-[#0A174C] text-amber-300 border-2 border-white'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spots Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {filteredSpots.map((spot) => (
          <div
            key={spot.id}
            onClick={() => {
              setSelectedSpot(spot);
              setActiveImageIndex(0);
            }}
            className={`bg-white rounded-2xl overflow-hidden border transition-all cursor-pointer shadow-xs hover:shadow-md ${
              selectedSpot?.id === spot.id
                ? 'border-[#0577B2] ring-2 ring-[#0577B2]/20'
                : 'border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="relative h-36 bg-slate-100 overflow-hidden">
              <img
                src={spot.images[0]}
                alt={spot.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-slate-900/80 text-white text-[10px] font-bold backdrop-blur-xs">
                {spot.category}
              </span>
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-amber-400 text-slate-900 text-[11px] font-black shadow-xs flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-slate-900" />
                {spot.rating}
              </span>
            </div>

            <div className="p-3.5">
              <h3 className="font-extrabold text-slate-900 text-sm truncate">{spot.name}</h3>

              <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <span className="truncate max-w-[160px]">{spot.address}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyAddress(spot.address);
                  }}
                  className="p-1 hover:bg-slate-100 text-slate-600 rounded-md transition-colors"
                  title="주소 복사"
                >
                  <Copy className="w-3.5 h-3.5 text-[#0577B2]" />
                </button>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-snug">
                {spot.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Food Spot Detail Drawer / Modal */}
      {selectedSpot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-[#0A174C] text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/20 font-bold">
                  {selectedSpot.category}
                </span>
                <h3 className="text-lg font-extrabold mt-1">{selectedSpot.name}</h3>
              </div>
              <button
                onClick={() => setSelectedSpot(null)}
                className="text-white/80 hover:text-white font-bold p-1 text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              {/* Image Carousel (2-3 Images) */}
              {selectedSpot.images.length > 0 && (
                <div className="relative rounded-xl overflow-hidden h-52 bg-slate-100 group">
                  <img
                    src={selectedSpot.images[activeImageIndex]}
                    alt={selectedSpot.name}
                    className="w-full h-full object-cover"
                  />

                  {selectedSpot.images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActiveImageIndex((prev) =>
                            prev === 0 ? selectedSpot.images.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setActiveImageIndex((prev) =>
                            prev === selectedSpot.images.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full">
                        {selectedSpot.images.map((_, idx) => (
                          <span
                            key={idx}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                              activeImageIndex === idx ? 'bg-white w-4' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Address with Copy Button */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#0577B2] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block">매장 위치 주소</span>
                    <span className="text-xs font-semibold text-slate-800">{selectedSpot.address}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyAddress(selectedSpot.address)}
                  className="px-2.5 py-1.5 bg-[#0577B2] text-white text-xs font-bold rounded-lg hover:bg-[#0A174C] transition-colors flex items-center gap-1 shrink-0 active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>주소 복사</span>
                </button>
              </div>

              {/* Details & Menu */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-900">맛집 소개</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedSpot.description}
                </p>
              </div>

              {selectedSpot.popularMenus.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-900">대표 추천 메뉴</h4>
                  <div className="space-y-1.5">
                    {selectedSpot.popularMenus.map((menu, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs font-medium border border-slate-100"
                      >
                        <span className="text-slate-800">{menu.name}</span>
                        <span className="font-extrabold text-[#0577B2]">{menu.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => handleCopyAddress(selectedSpot.address)}
                className="flex-1 py-2.5 bg-[#0577B2] text-white font-bold text-xs rounded-xl hover:bg-[#0A174C] transition-colors"
              >
                주소 복사하기
              </button>
              <button
                onClick={() => setSelectedSpot(null)}
                className="px-4 py-2.5 bg-slate-200 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-300 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Food Spot Modal */}
      {isAddingSpot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-5 my-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#0577B2]" />
                <span>새 주변 맛집 핀 제보</span>
              </h3>
              <button
                onClick={() => setIsAddingSpot(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSpot} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">상호명 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 엄마손떡볶이"
                  value={newSpotName}
                  onChange={(e) => setNewSpotName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">카테고리</label>
                  <select
                    value={newSpotCategory}
                    onChange={(e) => setNewSpotCategory(e.target.value as FoodSpot['category'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                  >
                    <option value="한식">한식</option>
                    <option value="양식/일식">양식/일식</option>
                    <option value="카페/디저트">카페/디저트</option>
                    <option value="분식">분식</option>
                    <option value="술집/야식">술집/야식</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">전화번호</label>
                  <input
                    type="text"
                    placeholder="02-000-0000"
                    value={newSpotPhone}
                    onChange={(e) => setNewSpotPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">주소 (복사 가능하도록 입력) *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 서울 서대문구 증가로10길 16-20"
                  value={newSpotAddress}
                  onChange={(e) => setNewSpotAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">맛집 소개 & 추천 메뉴</label>
                <textarea
                  rows={2}
                  placeholder="학생들에게 추천할 한줄 후기를 적어주세요."
                  value={newSpotDesc}
                  onChange={(e) => setNewSpotDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0577B2]"
                />
              </div>

              {/* Photo URLs (2-3 Images) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">사진 URL (2~3장 추천)</label>
                <input
                  type="text"
                  placeholder="사진 1 이미지 URL (기본값 제공)"
                  value={newSpotImage1}
                  onChange={(e) => setNewSpotImage1(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <input
                  type="text"
                  placeholder="사진 2 이미지 URL (선택)"
                  value={newSpotImage2}
                  onChange={(e) => setNewSpotImage2(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <input
                  type="text"
                  placeholder="사진 3 이미지 URL (선택)"
                  value={newSpotImage3}
                  onChange={(e) => setNewSpotImage3(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSpot(false)}
                  className="flex-1 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A174C] hover:bg-[#0577B2] text-white font-bold rounded-xl transition-colors"
                >
                  맛집 핀 추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
