"use client";

import useSWR from "swr";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../data-service";
import type { Category } from "../types";

/**
 * SWR hook to fetch categories
 */
export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<Category[]>(
    "categories",
    getCategories
  );

  return {
    categories: data ?? [],
    isLoading,
    isError: error,
    mutate, // allows manual revalidation
  };
}

/**
 * Mutation: Add a category
 */
export function useAddCategory() {
  const { mutate } = useCategories();

  async function add(newCategory: Omit<Category, "id" | "createdAt" | "updatedAt">) {
    const created = await addCategory(newCategory);
    // revalidate cache after mutation
    mutate();
    return created;
  }

  return { add };
}

/**
 * Mutation: Update a category
 */
export function useUpdateCategory() {
  const { mutate } = useCategories();

  async function update(
    id: string,
    updates: Partial<Omit<Category, "id" | "createdAt">>
  ) {
    const updated = await updateCategory(id, updates);
    mutate();
    return updated;
  }

  return { update };
}

/**
 * Mutation: Delete a category
 */
export function useDeleteCategory() {
  const { mutate } = useCategories();

  async function remove(id: string) {
    await deleteCategory(id);
    mutate();
    return true;
  }

  return { remove };
}
