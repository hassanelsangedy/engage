
export default function BackgroundDecoration() {
    return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
            <div className="absolute top-40 -left-20 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-50" />
        </div>
    )
}
