"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Separator } from "@/components/ui/Separator";
import { getWhatsAppContextLink, formatPhone } from "@/lib/utils";
import { Phone, MessageCircle, Star, MapPin, CheckCircle } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  category: string;
  languages: string[];
  sampradaya?: string;
  phone: string;
  email?: string;
  location: string;
  experience: string;
  about: string;
  rating?: number;
  verified?: boolean;
  photo?: string;
}

interface ProviderCardProps {
  provider: Provider;
  onContact?: (provider: Provider) => void;
  className?: string;
}

export function ProviderCard({ provider, onContact, className }: ProviderCardProps) {
  const whatsappLink = getWhatsAppContextLink(
    provider.phone,
    provider.name,
    'ritual'
  );

  const handleContact = () => {
    if (onContact) {
      onContact(provider);
    } else {
      window.open(whatsappLink, '_blank');
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={provider.photo} alt={provider.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {provider.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">
                {provider.name}
              </h3>
              {provider.verified && (
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </div>
            
            <p className="text-sm text-muted-foreground font-medium">
              {provider.category}
              {provider.experience && ` • ${provider.experience} experience`}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Status and Taxonomy Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {provider.verified && (
            <Badge variant="default" className="text-xs font-medium">Verified</Badge>
          )}
          {provider.sampradaya && (
            <Badge variant="secondary" className="text-xs font-medium">{provider.sampradaya}</Badge>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{provider.location}</span>
        </div>

        {/* Languages */}
        {provider.languages.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Languages</p>
            <div className="flex flex-wrap gap-1">
              {provider.languages.slice(0, 3).map((language) => (
                <Badge key={language} variant="outline" className="text-xs">
                  {language}
                </Badge>
              ))}
              {provider.languages.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{provider.languages.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Rating */}
        {provider.rating && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-current text-yellow-500" />
            <span className="text-sm font-medium">{provider.rating}</span>
            <span className="text-xs text-muted-foreground">rating</span>
          </div>
        )}

        <Separator />

        {/* About */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">About</p>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {provider.about}
          </p>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex gap-2 w-full">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={handleContact}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`tel:+91${provider.phone.replace(/\D/g, '')}`, '_blank')}
          >
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
