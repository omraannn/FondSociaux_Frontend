/*|--------------------------------------------------------------------------
|  Handle long title
|-------------------------------------------------------------------------- */
export const truncateTitle = (title: string): string => {
    const size = title.length;
    if (size > 25) {
        return `${title.substring(0, 25)}...`;
    }
    return title;
};