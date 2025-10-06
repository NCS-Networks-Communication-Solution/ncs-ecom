import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartItem } from '../CartItem';
import { useCart } from '@/contexts/CartContext';

jest.mock('@/contexts/CartContext', () => ({
  useCart: jest.fn(),
}));

const mockedUseCart = useCart as jest.MockedFunction<typeof useCart>;

describe('CartItem', () => {
  beforeEach(() => {
    mockedUseCart.mockReset();
  });

  const baseItem = {
    id: 'item-1',
    productId: 'prod-1',
    quantity: 3,
    unitPrice: 15000,
    total: 45000,
    product: {
      id: 'prod-1',
      sku: 'SW-24P-1G',
      nameEn: 'Managed Switch',
      nameTh: 'สวิตช์',
      price: 15000,
      description: 'Enterprise switch',
      descriptionEn: 'Enterprise switch',
      descriptionTh: 'สวิตช์สำหรับองค์กร',
      specifications: {},
      images: [],
      categoryId: 'cat-switch',
      category: {
        id: 'cat-switch',
        nameEn: 'Switches',
        nameTh: 'สวิตช์',
      },
    },
  } as const;

  it('increments quantity and reflects the new value after a successful update', async () => {
    const updateItem = jest.fn().mockResolvedValue(undefined);
    mockedUseCart.mockReturnValue({
      updateItem,
      removeItem: jest.fn(),
      addToCart: jest.fn(),
      refreshCart: jest.fn(),
      clearCart: jest.fn(),
      setAccessToken: jest.fn(),
      items: [baseItem],
      totals: { itemCount: 1, totalQuantity: 3, subtotal: 45000, tax: 3150, total: 48150 },
      isLoading: false,
      hasSession: true,
      error: null,
    });

    const user = userEvent.setup();
    render(<CartItem item={baseItem} />);

    await user.click(screen.getByRole('button', { name: '+' }));

    expect(updateItem).toHaveBeenCalledWith(baseItem.id, 4);

    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
  });

  it('removes the item when quantity drops to zero', async () => {
    const removeItem = jest.fn().mockResolvedValue(undefined);
    const updateItem = jest.fn().mockResolvedValue(undefined);

    mockedUseCart.mockReturnValue({
      updateItem,
      removeItem,
      addToCart: jest.fn(),
      refreshCart: jest.fn(),
      clearCart: jest.fn(),
      setAccessToken: jest.fn(),
      items: [{ ...baseItem, quantity: 1 }],
      totals: { itemCount: 1, totalQuantity: 1, subtotal: 15000, tax: 1050, total: 16050 },
      isLoading: false,
      hasSession: true,
      error: null,
    });

    const user = userEvent.setup();
    render(<CartItem item={{ ...baseItem, quantity: 1 }} />);

    await user.click(screen.getByRole('button', { name: '-' }));

    expect(removeItem).toHaveBeenCalledWith(baseItem.id);
    expect(updateItem).not.toHaveBeenCalled();
  });
});
