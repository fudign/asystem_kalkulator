'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  projectName: string | null;
  businessType: string | null;
  targetAudience: string | null;
  mainFeatures: string | null;
  budget: string | null;
  timeline: string | null;
  aiSummary: string | null;
  services: string | null;
  totalPrice: number | null;
  pdfUrl: string | null;
  demoUrl: string | null;
  createdAt: string;
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  projects: Project[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const isAdmin = (session?.user as any)?.role === 'admin';

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || !isAdmin) {
      router.push('/');
      return;
    }

    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session, status, isAdmin, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const clients = users.filter(u => u.role !== 'admin');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Админ-панель</h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← На главную
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Клиенты ({clients.length})
            </h2>
          </div>

          {clients.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Пока нет зарегистрированных клиентов
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {clients.map(user => {
                const project = user.projects?.[0];
                const isExpanded = expandedUser === user.id;

                return (
                  <div key={user.id} className="hover:bg-gray-50">
                    <div
                      className="px-6 py-4 cursor-pointer flex items-center justify-between"
                      onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {(user.name || user.email || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || 'Без имени'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email} {user.phone && `• ${user.phone}`}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {project && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Есть проект
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-6 pb-4">
                        {project ? (
                          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                            <h4 className="font-medium text-gray-900">
                              {project.projectName || 'Проект без названия'}
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {project.businessType && (
                                <div>
                                  <span className="text-gray-500">Тип бизнеса:</span>
                                  <p className="text-gray-900">{project.businessType}</p>
                                </div>
                              )}
                              {project.targetAudience && (
                                <div>
                                  <span className="text-gray-500">Целевая аудитория:</span>
                                  <p className="text-gray-900">{project.targetAudience}</p>
                                </div>
                              )}
                              {project.mainFeatures && (
                                <div className="md:col-span-2">
                                  <span className="text-gray-500">Основные функции:</span>
                                  <p className="text-gray-900">{project.mainFeatures}</p>
                                </div>
                              )}
                              {project.budget && (
                                <div>
                                  <span className="text-gray-500">Бюджет:</span>
                                  <p className="text-gray-900">{project.budget}</p>
                                </div>
                              )}
                              {project.timeline && (
                                <div>
                                  <span className="text-gray-500">Сроки:</span>
                                  <p className="text-gray-900">{project.timeline}</p>
                                </div>
                              )}
                              {project.totalPrice && (
                                <div>
                                  <span className="text-gray-500">Итого:</span>
                                  <p className="text-gray-900 font-semibold">
                                    {project.totalPrice.toLocaleString('ru-RU')} сом
                                  </p>
                                </div>
                              )}
                            </div>

                            {project.aiSummary && (
                              <div className="border-t pt-4">
                                <span className="text-gray-500 text-sm">AI-анализ:</span>
                                <p className="text-gray-900 mt-1">{project.aiSummary}</p>
                              </div>
                            )}

                            {(project.pdfUrl || project.demoUrl) && (
                              <div className="flex gap-3 pt-2">
                                {project.pdfUrl && (
                                  <a
                                    href={project.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Скачать PDF
                                  </a>
                                )}
                                {project.demoUrl && (
                                  <a
                                    href={project.demoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Демо сайт
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                            Клиент ещё не создавал проект
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
