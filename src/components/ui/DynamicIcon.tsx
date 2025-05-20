import React, {
    type CSSProperties,
    Suspense,
    type SVGAttributes,
    lazy,
    type JSX
} from "react";
import { IconContext } from "react-icons";

interface IProps {
    icon: string;
    color?: string;
    size?: string;
    className?: string;
    style?: CSSProperties;
    attr?: SVGAttributes<SVGElement>;
    fallback: JSX.Element | null;
}

const iconModule: Record<string, any> = {
    lu: (await import("react-icons/lu")),
    fa: (await import("react-icons/fa")),
}



const DynamicIcon: React.FC<IProps> = ({ ...props }) => {
    const [library, iconComponent] = props.icon.split("/");

    if (!library || !iconComponent) return <div>Could Not Find Icon</div>;

    const lib = library.toLowerCase();
    const Icon = lazy(async () => {
        /* @vite-ignore */
        const module = iconModule[lib];
        return { default: module[iconComponent as keyof typeof module] };
    });

    const value: IconContext = {
        color: props.color,
        size: props.size,
        className: props.className,
        style: props.style,
        attr: props.attr
    };

    return (
        <Suspense fallback={props.fallback}>
            <IconContext.Provider value={value}>
                <Icon />
            </IconContext.Provider>
        </Suspense>
    );
};

export default DynamicIcon;