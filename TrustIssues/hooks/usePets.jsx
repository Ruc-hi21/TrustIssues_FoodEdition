import { useEffect, useState } from "react";
import { petService } from "../services/petService";
import { useAllergenStore } from "../store/allergenStore";

export function usePets() {
  const { pets, setPets, addPet, removePet, updatePet } = useAllergenStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    petService
      .getPets()
      .then((res) => {
        if (!cancelled) setPets(res.pets || []);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const add = async (data) => {
    const res = await petService.addPet(data);
    if (res?.pet) addPet(res.pet);
    return res;
  };
  const remove = async (id) => {
    await petService.deletePet(id);
    removePet(id);
  };
  const update = async (id, data) => {
    const res = await petService.updatePet(id, data);
    updatePet(id, res?.pet || data);
    return res;
  };

  return { pets, addPet: add, removePet: remove, updatePet: update, loading };
}