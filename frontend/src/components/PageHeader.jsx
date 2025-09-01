import React from 'react';

const PageHeader = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  gradient = 'from-purple-600 to-blue-600',
  gradientFrom,
  gradientTo,
  stats = [],
  actions = []
}) => {
  const gradientClass = gradientFrom && gradientTo 
    ? `from-${gradientFrom}-600 to-${gradientTo}-600` 
    : gradient;

  return (
    <div className={`bg-gradient-to-r ${gradientClass} shadow-xl`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center space-x-4">
          {Icon && (
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Icon className="w-7 h-7 text-white" />
              </div>
            </div>
          )}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-lg text-white/90 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Stats Section */}
        {stats && stats.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center">
                  {stat.icon && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-white/80 uppercase tracking-wide">
                      {stat.label}
                    </dt>
                    <dd className="text-2xl font-bold text-white mt-1">
                      {stat.value}
                    </dd>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions Section */}
        {actions && actions.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
