'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dog } from "../types";
import { dogService } from "../services/api";

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favoritesIds = JSON.parse(
        localStorage.getItem("favorites") || "[]"
      );
      if (favoritesIds.length > 0) {
        const response = await dogService.getDogs(favoritesIds);
        setFavorites(response.data);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = (dogId: string) => {
    const favoritesIds = JSON.parse(localStorage.getItem("favorites") || "[]");
    const newFavorites = favoritesIds.filter((id: string) => id !== dogId);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    setFavorites(favorites.filter((dog) => dog.id !== dogId));
  };

  const generateMatch = async () => {
    try {
      const favoritesIds = favorites.map((dog) => dog.id);
      const response = await dogService.getMatch(favoritesIds);
      const matchedDog = favorites.find(
        (dog) => dog.id === response.data.match
      );

      alert(`You've been matched with ${matchedDog?.name}!`);
    } catch (error) {
      console.error("Error generating match:", error);
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Favorites</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Back to Dashboard
        </button>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center text-gray-500">
          No favorite dogs yet. Go to Dashboard page to add some!
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((dog) => (
              <div key={dog.id} className="border rounded-lg p-4">
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
                  onClick={() => removeFavorite(dog.id)}
                  className="mt-2 px-4 py-2 rounded bg-red-500 text-white"
                >
                  Remove from Favorites
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={generateMatch}
              className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg"
            >
              Generate Match ({favorites.length} selected)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
