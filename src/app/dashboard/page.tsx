"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { dogService } from "../services/api";
import { Dog } from "../types";
import { Pagination } from "../components/Pagination";

export default function SearchPage() {
  const router = useRouter();
  const [breeds, setBreeds] = useState<string[]>([]);
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBreeds();
    const savedFavorites = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );
    setFavorites(new Set(savedFavorites));
  }, []);

  useEffect(() => {
    searchDogs(currentPage);
  }, [selectedBreeds, sortOrder, currentPage]);

  const loadBreeds = async () => {
    try {
      const response = await dogService.getBreeds();
      setBreeds(response.data);
    } catch (error) {
      console.error("Error loading breeds:", error);
    }
  };

  const searchDogs = async (page: number) => {
    try {
      setLoading(true);
      const response = await dogService.searchDogs({
        breeds: selectedBreeds,
        sort: `breed:${sortOrder}`,
        size: 20,
        from: (page - 1) * 20 + "",
      });

      const dogDetails = await dogService.getDogs(response.data.resultIds);
      setDogs(dogDetails.data);
      setTotalPages(Math.ceil(response.data.total / 20));
    } catch (error) {
      console.error("Error searching dogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (dogId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(dogId)) {
      newFavorites.delete(dogId);
    } else {
      newFavorites.add(dogId);
    }
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(Array.from(newFavorites)));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Find Your Perfect Dog</h1>
        <button
          onClick={() => router.push("/favorites")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          View Favorites ({favorites.size})
        </button>
      </div>

      <div className="mb-8 flex gap-4">
        <select
          multiple
          className="w-1/2 p-2 border rounded"
          value={selectedBreeds}
          onChange={(e) => {
            const values = Array.from(
              e.target.selectedOptions,
              (option) => option.value
            );
            setSelectedBreeds(values);
            setCurrentPage(1);
          }}
        >
          {breeds.map((breed) => (
            <option key={breed} value={breed}>
              {breed}
            </option>
          ))}
        </select>

        <select
          className="p-2 border rounded"
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value as "asc" | "desc");
            setCurrentPage(1);
          }}
        >
          <option value="asc">Sort A-Z</option>
          <option value="desc">Sort Z-A</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dogs.map((dog) => (
              <div key={dog.id} className="border rounded-lg p-4 flex flex-col">
                <img
                  src={dog.img}
                  alt={dog.name}
                  className="w-full h-48 object-cover rounded"
                />
                <h3 className="text-xl font-bold mt-2">{dog.name}</h3>
                <p>Breed: {dog.breed}</p>
                <p>Age: {dog.age}</p>
                <p>Location: {dog.zip_code}</p>
                <button
                  onClick={() => toggleFavorite(dog.id)}
                  className={`mt-2 px-4 py-2 rounded ${
                    favorites.has(dog.id)
                      ? "bg-red-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {favorites.has(dog.id)
                    ? "Remove Favorite"
                    : "Add to Favorites"}
                </button>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
