//src/components/home/CategoriesSection.js

'use client'
import React, { useState } from 'react';
import { Package, Briefcase, Users } from 'lucide-react';
import { 
  productIconMap, 
  serviceIconMap, 
  employmentIconMap, 
  mainCategoryColors, 
  categoryColors 
} from '@/constants/categoryUI';
import { CATEGORIAS_PRODUCTOS, CATEGORIAS_SERVICIOS, CATEGORIAS_EMPLEO } from '../../types';



const CategoriesSection = ({
  categoryType = 'all', // 'all', 'productos', 'servicios', 'empleos'
  onCategoryClick,
  maxCategories = 12,
  counts = {},
  showToggle = true
}) => {
  const [activeTab, setActiveTab] = useState(categoryType === 'all' ? 'productos' : categoryType);

  // Función para obtener las categorías según el tipo
  const getCategoriesByType = (type) => {
    const iconMaps = {
      productos: productIconMap,
      servicios: serviceIconMap,
      empleos: employmentIconMap
    };

    const dataSources = {
      productos: CATEGORIAS_PRODUCTOS,
      servicios: CATEGORIAS_SERVICIOS,
      empleos: CATEGORIAS_EMPLEO
    };

    const source = dataSources[type];
    const iconMap = iconMaps[type];

    if (!source) return [];

    return Object.values(source)
      .slice(0, maxCategories)
      .map(categoria => ({
        id: categoria.id,
        name: categoria.nombre,
        icon: iconMap[categoria.id] || Package,
        color: categoryColors[categoria.id] || 'from-gray-400 to-gray-600',
        count: counts[categoria.id] || 0,
        subcategories: Object.keys(categoria.subcategorias || {}).length,
        type: type
      }));
  };

  const categories = categoryType === 'all' ? getCategoriesByType(activeTab) : getCategoriesByType(categoryType);

  const handleCategoryClick = (category) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  };

  const tabConfig = [
    { id: 'productos', name: 'Productos', icon: Package, color: 'text-amber-600' },
    { id: 'servicios', name: 'Servicios', icon: Briefcase, color: 'text-accent-600' },
    { id: 'empleos', name: 'Empleos', icon: Users, color: 'text-brand-teal-700' }
  ];

  return (
    <section className="pb-2 lg:pb-4 -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 sm:px-6 lg:px-8 py-16 lg:py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white tracking-tight">
              Explora por Categorías
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Descubre lo que tu comunidad tiene para ofrecer
            </p>
          </div>

          {/* Tabs for category types (only if categoryType is 'all' and showToggle is true) */}
          {categoryType === 'all' && showToggle && (
            <div className="flex justify-center mb-12">
              <div className="bg-white dark:bg-gray-900 p-1 sm:p-2 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-md">
                <div className="flex space-x-1 sm:space-x-2">
                  {tabConfig.map((tab) => {
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col sm:flex-row items-center justify-center flex-1 px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${isActive
                          ? `bg-gradient-to-r ${mainCategoryColors[tab.id]} text-white shadow-lg`
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                      >
                        <TabIcon className="w-5 h-5 sm:w-5 sm:h-5 sm:mr-2" />
                        <span className="text-xs sm:text-sm mt-1 sm:mt-0">{tab.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Categories Grid */}
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon;

              return (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className="group bg-white dark:bg-gray-900 p-3 sm:p-6 lg:p-8 rounded-2xl shadow-lg dark:shadow-gray-900/20 hover:shadow-2xl dark:hover:shadow-gray-900/40 transition-all duration-300 cursor-pointer text-center hover:-translate-y-2 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-600 relative overflow-hidden"
                >
                  {/* Background gradient effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-15 transition-opacity duration-300`}></div>

                  <div className="relative z-10">
                    {/* Icon container */}
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-3 sm:mb-4 lg:mb-6 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      <IconComponent
                        className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white"
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* Category name */}
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-sm sm:text-base lg:text-lg leading-tight">
                      {category.name}
                    </h3>

                    {/* Statistics */}
                    <div className="space-y-2">
                      {/* Count */}
                      {category.count > 0 && (
                        <div className="inline-flex items-center justify-center px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                          <span className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-200">
                            {category.count} {category.type === 'empleos' ? 'ofertas' : category.type === 'servicios' ? 'servicios' : 'productos'}
                          </span>
                        </div>
                      )}

                      {/* Subcategories count */}
                      {category.subcategories > 0 && (
                        <div className="inline-flex items-center justify-center px-2 py-1 bg-primary-50 dark:bg-primary-900/50 rounded-full ml-2">
                          <span className="text-xs font-medium text-primary-700 dark:text-primary-200">
                            {category.subcategories} tipos
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interaction indicator */}
                  <div className="absolute top-3 right-3 w-2 h-2 bg-primary-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              );
            })}
          </div>

          {/* Show all categories link */}
          <div className="text-center mt-12">
            <button
              onClick={() => onCategoryClick && onCategoryClick({ showAll: true, type: categoryType === 'all' ? activeTab : categoryType })}
              className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl dark:shadow-gray-900/20"
            >
              Ver todas las categorías
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;