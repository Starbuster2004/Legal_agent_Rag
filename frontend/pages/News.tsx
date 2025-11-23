import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Share2, Bookmark, ExternalLink, Clock, Scale } from 'lucide-react';
import { Button } from '../components/Button';
import { MockService } from '../services/mockService';
import { NewsItem } from '../types';

export const News: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('All');
  const [detailItem, setDetailItem] = useState<NewsItem | null>(null);

  // Fetch List
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const data = await MockService.getNews(selectedTag);
      setItems(data);
      setLoading(false);
    };
    fetchNews();
  }, [selectedTag]);

  // Fetch Detail if ID exists
  useEffect(() => {
    if (id) {
      const fetchDetail = async () => {
        const item = await MockService.getNewsById(id);
        if (item) setDetailItem(item);
      };
      fetchDetail();
    } else {
      setDetailItem(null);
    }
  }, [id]);

  const tags = ['All', 'Supreme Court', 'Corporate', 'Criminal', 'IP Law', 'Technology', 'Environment'];

  // Detail View
  if (id && detailItem) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen py-8 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Button variant="ghost" onClick={() => navigate('/news')} className="mb-6 -ml-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to News
          </Button>
          
          <article className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
             {detailItem.imageUrl && (
               <div className="h-64 w-full relative">
                 <img src={detailItem.imageUrl} alt={detailItem.title} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                 <div className="absolute bottom-4 left-6 right-6">
                    <div className="flex gap-2 mb-2">
                      {detailItem.tags.map(tag => (
                        <span key={tag} className="bg-blue-600/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                 </div>
               </div>
             )}
             
             <div className="p-8">
               <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-4 space-x-4">
                 <span className="flex items-center font-medium text-blue-600 dark:text-blue-400">
                   {detailItem.source}
                 </span>
                 <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                 <span className="flex items-center">
                   <Calendar className="w-4 h-4 mr-1" />
                   {new Date(detailItem.published_at).toLocaleDateString()}
                 </span>
               </div>

               <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                 {detailItem.title}
               </h1>

               <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                 <p className="lead text-lg text-slate-600 dark:text-slate-300 font-medium mb-6">{detailItem.snippet}</p>
                 <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                   {detailItem.content || "Full article content would be fetched from the backend API here..."}
                 </p>
               </div>

               <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700">
                 <Button variant="outline" size="sm">
                   <ExternalLink className="w-4 h-4 mr-2" />
                   Read Original Source
                 </Button>
                 <div className="flex gap-2">
                   <Button variant="ghost" size="sm"><Bookmark className="w-4 h-4" /></Button>
                   <Button variant="ghost" size="sm"><Share2 className="w-4 h-4" /></Button>
                 </div>
               </div>
             </div>
          </article>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Daily Legal Updates</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Curated news, case laws, and regulatory changes.</p>
          </div>
          <div className="mt-4 md:mt-0">
             {/* Search placeholder */}
          </div>
        </div>

        {/* Tags / Filters */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl h-80 animate-pulse border border-slate-200 dark:border-slate-700"></div>
            ))}
          </div>
        )}

        {/* News Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <div 
                key={item.id} 
                onClick={() => navigate(`/news/${item.id}`)}
                className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col"
              >
                <div className="h-48 overflow-hidden relative">
                   {item.imageUrl ? (
                     <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   ) : (
                     <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                       <Scale className="w-12 h-12 text-slate-300 dark:text-slate-500" />
                     </div>
                   )}
                   <div className="absolute top-3 right-3">
                     {Date.now() - new Date(item.published_at).getTime() < 86400000 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Latest</span>
                     )}
                   </div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{item.source}</span>
                    <span className="text-xs text-slate-400 flex items-center">
                       <Clock className="w-3 h-3 mr-1" />
                       {new Date(item.published_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 flex-grow">
                    {item.snippet}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {item.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                        <Tag className="w-3 h-3 mr-1 text-slate-400" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};