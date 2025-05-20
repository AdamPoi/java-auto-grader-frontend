
import * as luIcons from "react-icons/lu";
import { type IconType } from "react-icons";

interface IconProps {
    icon: string;
    className?: string;
}

const Icon = ({ icon, className }: IconProps) => {
    const getIcon = (iconName: string) => {
        const iconsMap = new Map();

        iconsMap.set("Lu", luIcons);

        return iconsMap.get(iconName.substring(0, 2));
    };

    const icons: any = getIcon(icon);
    const TheIcon: IconType = icons[icon];

    return <TheIcon className={className} />;
};

export default Icon;