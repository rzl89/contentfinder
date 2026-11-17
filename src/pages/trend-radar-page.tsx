import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrendStore } from '@/stores/trend-store';
import { useProjectStore } from '@/stores/project-store';
import { useLanguageStore } from '@/stores/language-store';
import {
  BentoTile,
  Button,
  Badge,
  Input,
  Select,
} from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import {
  TrendingUp,
  Search,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Globe2,
  Calendar,
  FileText,
} from 'lucide-react';
import type { Platform } from '@/types';

export const TrendRadarPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { language, t } = useLanguageStore();
  const {
    selectedPlatform,
    selectedStatus,
    searchQuery,
    setPlatform,
    setStatus,
    setSearchQuery,
    getFilteredTrends,
    isLiveFeedAvailable,
  } = useTrendStore();

  const { createProject } = useProjectStore();
  const trends = getFilteredTrends();

  const handleCreateFromTrend = (trend: any) => {
    const targetCat = trend.categoryRelevance[0] || 'pov-experience';
    const trendTitle = language === 'en' ? (trend.titleEn || trend.title) : trend.title;
    createProject(`Trend: ${trendTitle}`, targetCat, 'indonesia_natural');

    showToast({
      type: 'success',
      title: t('Proyek Baru Dibuat dari Tren', 'New Project Created from Trend'),
      message: t(
        `Mengarahkan ke Idea Studio untuk mengeksplorasi format "${trendTitle}"`,
        `Redirecting to Idea Studio to explore format "${trendTitle}"`
      ),
    });

    navigate('/studio', {
      state: {
        categoryId: targetCat,
        topic: trendTitle,
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#14141c] via-[#101015] to-[#14141c] border border-white/10 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {t('Trend Radar Studio', 'Trend Radar Studio')}
            </h2>
            <p className="text-xs text-zinc-400">
              {t(
                'Observasi pola tren tervalidasi dari TikTok Creative Center, YouTube Culture & Trends, dan Meta Creators.',
                'Verified trend pattern observations from TikTok Creative Center, YouTube Culture & Trends, and Meta Creators.'
              )}
            </p>
          </div>
        </div>

        {/* Live Feed Transparency Banner */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 mt-4">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5 text-zinc-300">
            <span className="font-semibold text-amber-300 block">
              {t('Prinsip Transparansi Data: Nol Angka Fiktif', 'Data Transparency Principle: Zero Fabricated Metrics')}
            </span>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              {isLiveFeedAvailable
                ? t('Terhubung ke Live API platform.', 'Connected to live platform API.')
                : t(
                    'Data live API saat ini belum terhubung. Seluruh entri di bawah diambil langsung dari publikasi resmi platform (Creative Center Q1 Report, Meta Best Practices, YouTube Trends). Fixprom tidak pernah mengarang angka views atau melabeli konten "viral" tanpa bukti terverifikasi.',
                    'Live API feed is currently unlinked. All entries below are directly sourced from official platform publications (Creative Center Reports, Meta Best Practices, YouTube Trends). Fixprom never invents fake view counts or labels content "viral" without verified evidence.'
                  )}
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-[#111115] border border-white/10">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <div className="w-full md:w-64">
            <Input
              placeholder={t('Cari tren, format, atau kategori...', 'Search trends, formats, or categories...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-3.5 h-3.5" />}
            />
          </div>

          <div className="w-40">
            <Select
              value={selectedPlatform}
              onChange={(e) => setPlatform(e.target.value as Platform | 'all')}
              options={[
                { value: 'all', label: t('Semua Platform', 'All Platforms') },
                { value: 'tiktok', label: 'TikTok' },
                { value: 'youtube_shorts', label: 'YouTube Shorts' },
                { value: 'instagram_reels', label: 'Instagram Reels' },
                { value: 'multi_platform', label: t('Multi-Platform', 'Multi-Platform') },
              ]}
            />
          </div>

          <div className="w-44">
            <Select
              value={selectedStatus}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'all', label: t('Semua Status', 'All Statuses') },
                { value: 'verified_trend', label: t('Tren Terverifikasi', 'Verified Trend') },
                { value: 'trend_inspired', label: t('Terinspirasi Tren', 'Trend-Inspired') },
                { value: 'evergreen', label: t('Format Evergreen', 'Evergreen Format') },
              ]}
            />
          </div>
        </div>

        <span className="text-xs text-zinc-500 font-mono">
          {trends.length} {t('observasi ditemukan', 'observations found')}
        </span>
      </div>

      {/* Trend Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trends.map((item) => {
          const displayTitle = language === 'en' ? (item.titleEn || item.title) : item.title;
          const displayDesc = language === 'en' ? (item.descriptionEn || item.description) : item.description;
          const displayEvidence = language === 'en' ? (item.evidenceEn || item.evidence) : item.evidence;
          const displayFormat = language === 'en' ? (item.formatEn || item.format) : item.format;
          const displayRegion = language === 'en' ? (item.regionEn || item.region) : item.region;

          return (
            <BentoTile
              key={item.id}
              className="p-5 border-white/10 hover:border-amber-500/30 flex flex-col justify-between space-y-4 bg-[#111115]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        item.status === 'verified_trend'
                          ? 'emerald'
                          : item.status === 'trend_inspired'
                          ? 'amber'
                          : 'blue'
                      }
                    >
                      {item.status === 'verified_trend'
                        ? t('TREN TERVERIFIKASI', 'VERIFIED TREND')
                        : item.status === 'trend_inspired'
                        ? t('TERINSPIRASI TREN', 'TREND INSPIRED')
                        : t('EVERGREEN', 'EVERGREEN')}
                    </Badge>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                        item.platform === 'tiktok'
                          ? 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                          : item.platform === 'youtube_shorts'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : item.platform === 'instagram_reels'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}
                    >
                      {item.platform === 'tiktok'
                        ? 'TikTok'
                        : item.platform === 'youtube_shorts'
                        ? 'YouTube Shorts'
                        : item.platform === 'instagram_reels'
                        ? 'Instagram Reels'
                        : 'Multi-Platform'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                    <Globe2 className="w-3 h-3 text-zinc-500" />
                    <span>{displayRegion}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{displayTitle}</h3>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    {displayDesc}
                  </p>
                </div>

                {/* Verified Evidence Box */}
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-zinc-400 text-[10px]">
                    <span className="font-semibold text-amber-300 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {t('Bukti & Sumber Observasi', 'Observation Evidence & Source')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.observedAt).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID')}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    {displayEvidence}
                  </p>
                  <div className="pt-1">
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 underline"
                    >
                      <span>{t('Buka Laporan Resmi Vendor', 'Open Official Vendor Report')}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>

                {/* Category tags */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-zinc-500">
                    {t('Relevan dengan:', 'Relevant categories:')}
                  </span>
                  {item.categoryRelevance.map((catId) => (
                    <span
                      key={catId}
                      className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono border border-white/5"
                    >
                      {catId}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-mono">{displayFormat}</span>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Sparkles className="w-3.5 h-3.5 text-black" />}
                  onClick={() => handleCreateFromTrend(item)}
                >
                  {t('Buat Ide dari Tren Ini', 'Create Idea from Trend')}
                </Button>
              </div>
            </BentoTile>
          );
        })}
      </div>
    </div>
  );
};
