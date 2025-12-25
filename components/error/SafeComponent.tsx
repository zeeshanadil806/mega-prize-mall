// import { log } from "@/lib/logger"

// export async function SafeComponent<T>({
//   promise,
//   children,
//   fallback,
// }: {
//   promise: Promise<T>
//   children: (data: T) => React.ReactNode
//   fallback?: React.ReactNode
// }) {
//   try {
//     const data = await promise
//     return <>{children(data)}</>
//   } catch (error) {
//     log.error("Component error", { error })
    
//     if (fallback) return <>{fallback}</>
    
//     return (
//       <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
//         <p className="text-red-700">Failed to load data</p>
//       </div>
//     )
//   }
// }