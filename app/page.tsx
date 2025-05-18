"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";

interface Apartment {
  id: number;
  price: number;
  sqMeters: number;
  plan: string;
  projectName: string;
  roomsCount: number;
  imageUrl: string;
  floor: number;
  link: string;
  status: string;
  tag: string[];
  projectLink: string;
}

interface FetchedApartmentData {
  id: number;
  price: number;
  sqMeters: number;
  plan: string;
  projectName: string;
  roomsCount: number;
  imageUrl: string;
  floor: number;
  link: string;
  status: string;
  tag: string | string[] | null | undefined;
  projectLink: string;
  createdAt: string;
  updatedAt: string;
}

function HomePage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    projectName: "",
    minArea: "",
    maxArea: "",
    rooms: "",
    floor: "",
  });
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sortBy, setSortBy] = useState<string>(""); // 'price' or 'sqMeters'
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // 'asc' or 'desc'

  const fetchApartments = async () => {
    try {
      const response = await fetch("/api/apartments");
      const data: FetchedApartmentData[] = await response.json();

      const apartmentsWithArrayTags: Apartment[] = data.map((apt) => ({
        ...apt,
        tag: Array.isArray(apt.tag) ? apt.tag : apt.tag ? [apt.tag] : [],
      }));
      setApartments(apartmentsWithArrayTags);
    } catch (error) {
      console.error("Failed to fetch apartments:", error);
    }
  };

  const syncApartments = async () => {
    setLoading(true);
    try {
      await fetch("/api/apartments", { method: "POST" });
      await fetchApartments();
    } catch (error) {
      console.error("Failed to sync apartments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Get unique values for filters
  const uniqueProjects = useMemo(
    () => Array.from(new Set(apartments.map((apt) => apt.projectName))).sort(),
    [apartments]
  );

  const uniqueRooms = useMemo(
    () =>
      Array.from(new Set(apartments.map((apt) => apt.roomsCount))).sort(
        (a, b) => a - b
      ),
    [apartments]
  );

  const uniqueFloors = useMemo(
    () =>
      Array.from(new Set(apartments.map((apt) => apt.floor))).sort(
        (a, b) => a - b
      ),
    [apartments]
  );

  const filteredAndSortedApartments = useMemo(() => {
    const filtered = apartments.filter((apt) => {
      const price = apt.price;
      const area = apt.sqMeters;

      return (
        (!filters.minPrice || price >= Number(filters.minPrice)) &&
        (!filters.maxPrice || price <= Number(filters.maxPrice)) &&
        (!filters.projectName || apt.projectName === filters.projectName) &&
        (!filters.minArea || area >= Number(filters.minArea)) &&
        (!filters.maxArea || area <= Number(filters.maxArea)) &&
        (!filters.rooms || apt.roomsCount === Number(filters.rooms)) &&
        (!filters.floor || apt.floor === Number(filters.floor))
      );
    });

    // Apply sorting
    if (!sortBy) return filtered; // No sorting applied

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortBy === "price") {
        comparison = a.price - b.price;
      } else if (sortBy === "sqMeters") {
        comparison = a.sqMeters - b.sqMeters;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [apartments, filters, sortBy, sortOrder]);

  return (
    <main className="container mx-auto px-4 py-8 w-full max-w-2/3">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bonava Apartments</h1>
        <button
          onClick={syncApartments}
          disabled={loading}
          className="main-btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? "Запрос Идет..." : "Запросить Квартиры"}
        </button>
      </div>

      {/* Filters */}
      <div className="filters grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Цена</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Мин"
              value={
                filters.minPrice
                  ? String(filters.minPrice).replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      " "
                    )
                  : ""
              }
              onChange={(e) => {
                const rawValue = e.target.value.replace(/[^\d]/g, "");
                setFilters((prev) => ({ ...prev, minPrice: rawValue }));
              }}
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Макс"
              value={
                filters.maxPrice
                  ? String(filters.maxPrice).replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      " "
                    )
                  : ""
              }
              onChange={(e) => {
                const rawValue = e.target.value.replace(/[^\d]/g, "");
                setFilters((prev) => ({ ...prev, maxPrice: rawValue }));
              }}
              className="px-3 py-2 border rounded"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Проект</label>
          <select
            value={filters.projectName}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, projectName: e.target.value }))
            }
            className="px-3 py-2 border rounded"
          >
            <option value="">Все проекты</option>
            {uniqueProjects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Площадь (м²)</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Мин"
              value={filters.minArea}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, minArea: e.target.value }))
              }
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Макс"
              value={filters.maxArea}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, maxArea: e.target.value }))
              }
              className="px-3 py-2 border rounded"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Кол-во комнат</label>
          <select
            value={filters.rooms}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, rooms: e.target.value }))
            }
            className="px-3 py-2 border rounded"
          >
            <option value="">Любое</option>
            {uniqueRooms.map((rooms) => (
              <option key={rooms} value={rooms}>
                {rooms}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Этаж</label>
          <select
            value={filters.floor}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, floor: e.target.value }))
            }
            className="px-3 py-2 border rounded"
          >
            <option value="">Любой</option>
            {uniqueFloors.map((floor) => (
              <option key={floor} value={floor}>
                {floor}
              </option>
            ))}
          </select>
        </div>

        {/* Sorting Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Сортировка</label>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [criteria, order] = e.target.value.split("-");
              setSortBy(criteria);
              setSortOrder(order as "asc" | "desc");
            }}
            className="px-3 py-2 border rounded"
          >
            <option value="">Без сортировки</option>
            <option value="price-asc">По возрастанию цены</option>
            <option value="price-desc">По убыванию цены</option>
            <option value="sqMeters-asc">По возрастанию площади</option>
            <option value="sqMeters-desc">По убыванию площади</option>
          </select>
        </div>
      </div>

      {/* Modal for large image */}
      {modalImage && (
        <div
          className="modal fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setModalImage(null)}
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-4 max-w-3xl w-4/5 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-btn absolute top-2 right-2 text-gray-500 hover:text-gray-800 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-xl"
              onClick={() => setModalImage(null)}
              aria-label="Close modal"
            >
              &times;
            </button>
            <Image
              src={modalImage}
              alt="Large Apartment Plan"
              width={1200}
              height={900}
              className="w-full h-auto max-h-[80vh] object-contain rounded"
            />
          </div>
        </div>
      )}

      {/* Content Area (Loader, Empty View, or Cards) */}
      {loading || apartments.length === 0 ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <svg
            className="animate-spin h-8 text-emerald-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
          <span className="ml-4 text-emerald-700 font-semibold">
            Загрузка квартир...
          </span>
        </div>
      ) : filteredAndSortedApartments.length === 0 ? (
        <div className="flex justify-center items-center min-h-[200px] text-gray-600 font-semibold text-lg">
          Ничего не найдено
        </div>
      ) : (
        /* Apartment Cards Grid */
        <div className="cards grid mt-8">
          {filteredAndSortedApartments.map((apt) => (
            <div
              key={apt.id}
              className="card bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col"
            >
              <div
                className="relative w-full h-64 bg-gray-100 cursor-pointer"
                onClick={() => setModalImage(apt.imageUrl)}
                title="Click to enlarge"
              >
                <Image
                  src={apt.imageUrl}
                  alt="Apartment Plan"
                  width={700}
                  height={500}
                  className="img-card"
                />
              </div>
              <div className="p-6 flex flex-col gap-2">
                Адрес - {apt.plan}
                <div className="text-gray-700 font-semibold">
                  Цена - €{apt.price.toLocaleString()}
                </div>
                <div className="text-gray-500">Площадь: {apt.sqMeters} m²</div>
                <div className="text-gray-500">
                  Кол-во комнат: {apt.roomsCount}
                </div>
                <div className="text-gray-500">Этаж: {apt.floor}</div>
                <div className="text-gray-500">
                  Проект:
                  <span className="font-semibold">{apt.projectName}</span>
                </div>
                <div className="flex gap-2 mt-2 items-center">
                  {apt.status && (
                    <span className="status px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs font-semibold">
                      Статус - {apt.status}
                    </span>
                  )}
                  {apt.tag &&
                    JSON.parse(apt.tag).map(
                      (singleTag: string, index: number) => (
                        <span
                          key={index}
                          className="tag px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold"
                        >
                          {singleTag}
                        </span>
                      )
                    )}
                </div>
                <div className="buttons-show">
                  <a
                    href={apt.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-bold text-emerald-700 hover:underline"
                  >
                    <button className="show-apartament-btn">
                      Посмотреть квартиру
                    </button>
                  </a>
                  <a
                    href={apt.projectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-bold text-emerald-700 hover:underline"
                  >
                    <button className="show-apartament-btn">
                      Посмотреть проект
                    </button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Scroll to top button */}
      <button
        className={
          `up-btn fixed bottom-4 right-4 bg-emerald-600 text-white p-3 rounded-full shadow-lg transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 z-10` +
          (showScrollButton ? " opacity-100 visible" : " opacity-0 invisible")
        }
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
      >
        <span>Наверх</span>
      </button>
    </main>
  );
}

export default dynamic(() => Promise.resolve(HomePage), { ssr: false });
