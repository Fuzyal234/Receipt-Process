declare module 'react-icons/hi' {
  import * as React from 'react';
  
  export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
    children?: React.ReactNode;
    size?: string | number;
    color?: string;
    title?: string;
  }
  
  export type IconType = (props: IconBaseProps) => JSX.Element;
  
  export const HiDocumentText: IconType;
  export const HiSparkles: IconType;
  export const HiCloudUpload: IconType;
  export const HiCamera: IconType;
  export const HiCheckCircle: IconType;
  export const HiX: IconType;
  export const HiDownload: IconType;
  export const HiEye: IconType;
  export const HiChevronLeft: IconType;
  export const HiChevronRight: IconType;
  export const HiCurrencyDollar: IconType;
  export const HiCash: IconType;
  export const HiShoppingCart: IconType;
  export const HiTruck: IconType;
  export const HiCalculator: IconType;
  export const HiLocationMarker: IconType;
  export const HiPhone: IconType;
  export const HiCalendar: IconType;
}

