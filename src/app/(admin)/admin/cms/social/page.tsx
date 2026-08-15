'use client';

import React, { useState } from 'react';
import { useAdminPage } from '@/contexts/AdminPageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { mockSocialLinks, SocialLink } from '@/lib/mock-data/cms/social-links';
import { Globe, Share2, Video, MessageCircle, Briefcase } from 'lucide-react';

export default function SocialLinksManagementPage() {
  const { setPageInfo } = useAdminPage();
  const [links, setLinks] = useState<SocialLink[]>(mockSocialLinks);
  const [hasChanges, setHasChanges] = useState(false);

  React.useEffect(() => {
    setPageInfo({
      title: 'Social Links',
      breadcrumbs: [
        { label: 'CMS', href: '/admin/cms/pages' },
        { label: 'Social Links', href: '/admin/cms/social' }
      ]
    });
  }, [setPageInfo]);

  const handleChange = (index: number, field: keyof SocialLink, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
    setHasChanges(true);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Facebook': return <Share2 className="w-5 h-5 text-[#1877F2]" />;
      case 'Instagram': return <Share2 className="w-5 h-5 text-[#E4405F]" />;
      case 'YouTube': return <Video className="w-5 h-5 text-[#FF0000]" />;
      case 'TikTok': return <span className="font-bold text-lg leading-none">tik<span className="text-[#00f2fe]">tok</span></span>;
      case 'WhatsApp': return <MessageCircle className="w-5 h-5 text-[#25D366]" />;
      case 'LinkedIn': return <Briefcase className="w-5 h-5 text-[#0A66C2]" />;
      default: return <Globe className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* LEFT COLUMN: Main Form */}
      <div className="flex-1 space-y-6">
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">Social Media Profiles</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {links.map((link, index) => (
                <div key={link.platform} className="p-6 flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="w-40 flex items-center gap-3 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                      {getPlatformIcon(link.platform)}
                    </div>
                    <span className="font-medium text-slate-700">{link.platform}</span>
                  </div>
                  
                  <div className="flex-1">
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleChange(index, 'url', e.target.value)}
                      placeholder={`https://${link.platform.toLowerCase()}.com/...`}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow"
                    />
                  </div>

                  <div className="flex items-center gap-3 md:w-32 justify-end">
                    <span className="text-sm font-medium text-slate-500">{link.status}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={link.status === 'Active'}
                        onChange={(e) => handleChange(index, 'status', e.target.checked ? 'Active' : 'Inactive')}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: Sticky Save */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="sticky top-6">
          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                Save Settings
                {hasChanges && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <p className="text-sm text-slate-600">
                {hasChanges 
                  ? "You have unsaved changes to your social links." 
                  : "All social links are up to date."}
              </p>
              <button
                onClick={() => {
                  alert('Social links saved successfully!');
                  setHasChanges(false);
                }}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  hasChanges 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                Save Social Links
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
