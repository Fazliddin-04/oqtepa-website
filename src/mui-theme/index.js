import { createTheme } from '@mui/material'

export default createTheme({
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
  components: {
    MuiLoadingButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingTop: 14,
          paddingBottom: 14,
          boxShadow: 'unset !important'
        },
      },
    },
  },
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: '#e62b40',
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: '#f4e1e3',
      // dark: will be calculated from palette.secondary.main,
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 576,
      md: 992,
      lg: 1248,
      xl: 1440,
    },
  },
})
