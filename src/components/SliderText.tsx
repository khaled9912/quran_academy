import Link from "next/link";
import { SliderTextProps } from "../../types/index";

const SliderText = ({ title, description, url }: SliderTextProps) => {
  return (
    <div className="h-1/2 xl:w-1/2 xl:h-full flex flex-col items-center justify-center gap-8 2xl:gap-12 text-center">
      <h2 className="text-xl lg:text-3xl 2xl:text-5xl ">{description}</h2>
      <h1 className="text-4xl max-sm:text-3xl lg:text-5xl 2xl:text-6xl font-semibold">
        {title}
      </h1>
      <Link href={url}>
        <button className="mt-6 px-4 py-2 bg-green-500 text-white rounded ">
          Free trial
        </button>
      </Link>
    </div>
  );
};

export default SliderText;
