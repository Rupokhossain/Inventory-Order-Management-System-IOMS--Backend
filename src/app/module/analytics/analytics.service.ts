import { OrderStatus, Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";



const getSummary = async () => {
    const totalUsers = await prisma.user.count({
    where: { role: Role.CUSTOMER },
  });

  const totalProducts = await prisma.product.count();

  const totalOrders = await prisma.order.count();

  const revenueResult = await prisma.order.aggregate({
    _sum: {
      totalAmount: true,
    },
    where: {
      status: {
        not: OrderStatus.CANCELLED,
      },
    },
  });


  const lowStockCount = await prisma.product.count({
    where: {
      stockQuantity: {
        lte: 5,
      },
    },
  });


  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: revenueResult._sum.totalAmount || 0,
    lowStockProductsCount: lowStockCount,
  };

}