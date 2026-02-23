import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'rams_selected_project';

@Injectable({
  providedIn: 'root',
})
export class ProjectSelectionService {
  private selectedProjectSubject = new BehaviorSubject<string | null>(
    this.getStoredProject()
  );

  selectedProject$ = this.selectedProjectSubject.asObservable();

  get selectedProject(): string | null {
    return this.selectedProjectSubject.getValue();
  }

  setSelectedProject(projectName: string | null): void {
    const value = projectName?.trim() || null;
    this.selectedProjectSubject.next(value);
    try {
      if (value) {
        localStorage.setItem(STORAGE_KEY, value);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to persist selected project', e);
    }
  }

  clearSelectedProject(): void {
    this.setSelectedProject(null);
  }

  /**
   * Returns the project from availableProjects that matches the globally selected project.
   * Uses case-insensitive matching and normalizes whitespace.
   * Returns null if no match.
   */
  getMatchingProject(availableProjects: string[]): string | null {
    const selected = this.selectedProject;
    if (!selected || !availableProjects?.length) return null;
    const normalized = this.normalizeForMatch(selected);
    return availableProjects.find(
      (p) => this.normalizeForMatch(p) === normalized
    ) || null;
  }

  private normalizeForMatch(name: string): string {
    return (name || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  private getStoredProject(): string | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored?.trim() || null;
    } catch {
      return null;
    }
  }
}
