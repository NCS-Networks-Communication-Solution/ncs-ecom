import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartDropdown } from '../CartDropdown';
import { useCart } from '@/contexts/CartContext';

jest.mock('@/contexts/CartContext', () => ({
  useCart: jest.fn(),
}));

jest.mock('@/components/cart/CartItem', () => ({
  CartItem: ({ item }: { item: { product: { nameEn: string } } }) => (
    <div data-testid="cart-item">{item.product.nameEn}</div>
  ),
}));

const mockedUseCart = useCart as jest.MockedFunction<typeof useCart>;

describe('CartDropdown', () => {
  beforeEach(() => {
    mockedUseCart.mockReset();
  });

  it('shows the empty state when there are no items', async () => {
    mockedUseCart.mockReturnValue({
      items: [],
      totals: {
        itemCount: 0,
        totalQuantity: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
      },
      clearCart: jest.fn(),
      isLoading: false,
      hasSession: true,
      error: null,
      refreshCart: jest.fn(),
      addToCart: jest.fn(),
      updateItem: jest.fn(),
      removeItem: jest.fn(),
      setAccessToken: jest.fn(),
    });

    const user = userEvent.setup();
    render(<CartDropdown />);

    await user.click(screen.getByRole('button', { name: /cart/i }));

    expect(screen.getByText('Cart is empty.')).toBeInTheDocument();
  });

  it('renders totals with VAT breakdown when items are present', async () => {
    mockedUseCart.mockReturnValue({
      items: [
        {
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
        },
      ],
      totals: {
        itemCount: 1,
        totalQuantity: 3,
        subtotal: 45000,
        tax: 3150,
        total: 48150,
      },
      clearCart: jest.fn(),
      isLoading: false,
      hasSession: true,
      error: null,
      refreshCart: jest.fn(),
      addToCart: jest.fn(),
      updateItem: jest.fn(),
      removeItem: jest.fn(),
      setAccessToken: jest.fn(),
    });

    const user = userEvent.setup();
    render(<CartDropdown />);

    await user.click(screen.getByRole('button', { name: /cart/i }));

    expect(screen.getByTestId('cart-item')).toHaveTextContent('Managed Switch');
    expect(screen.getByText('Items')).toBeInTheDocument();
    expect(screen.getByText('VAT (7%)')).toBeInTheDocument();
    expect(screen.getByText(/฿3,150\.00/)).toBeInTheDocument();
    expect(screen.getByText(/฿48,150.00/)).toBeInTheDocument();
    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });
});
