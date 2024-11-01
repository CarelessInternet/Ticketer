import NextImage, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

export default function Image(properties: ImageProps) {
	return <NextImage {...properties} className={cn('pb-2', properties.className)} />;
}
