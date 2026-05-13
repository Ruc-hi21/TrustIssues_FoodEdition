import { useEffect, useState } from "react";
import { userService } from "../services/userService";
import { useAllergenStore } from "../store/allergenStore";

export function useAllergens() {
  const { allergens, setAllergens, addAllergen, removeAllergen } =
    useAllergenStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    userService
      .getAllergens()
      .then((res) => {
        if (!cancelled) setAllergens(res.allergens || []);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const add = async (allergen, severity) => {
    const res = await userService.addAllergen(allergen, severity);
    if (res?.allergen) addAllergen(res.allergen);
    return res;
  };

  const remove = async (id) => {
    await userService.deleteAllergen(id);
    removeAllergen(id);
  };

  return { allergens, addAllergen: add, removeAllergen: remove, loading };
}