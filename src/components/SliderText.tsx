import Link from 'next/link';
import { SliderTextProps } from '../../types/index';

const SliderText = ({ title, description, url }: SliderTextProps) => {
  return (
    <div className="h-1/2 xl:w-1/2 xl:h-full flex flex-col items-center justify-center gap-8 2xl:gap-12 text-center">
      <h2 className="text-xl lg:text-3xl 2xl:text-5xl">{description}</h2>
      <h1 className="text-5xl lg:text-6xl 2xl:text-8xl font-semibold">
        {title}
      </h1>
      <Link href={url}>
        <button className="rounded-md bg-black text-white py-3 px-4 ">
          Free trial
        </button>
      </Link>
    </div>
  );
};

export default SliderText;
