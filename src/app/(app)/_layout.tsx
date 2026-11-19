import { StyleSheet } from 'react-native';
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';

import { NAV_ITEMS, NavButton, bottomNavStyles } from '@/components/BottomNav';
import { colors } from '@/theme';

/**
 * Área logada: conteúdo da aba + barra de navegação inferior personalizada.
 * Atenção: o `Tabs` do expo-router lê os `TabTrigger` diretamente dos filhos,
 * por isso o `TabList` precisa ficar aqui e não dentro de outro componente.
 * Os dados de turmas/alunos vêm do `EscolaProvider` no layout raiz.
 */
export default function AppLayout() {
  return (
    <Tabs style={styles.container}>
      <TabSlot />
      <TabList style={bottomNavStyles.bar}>
        {NAV_ITEMS.map(({ name, href, label, Icon }) => (
          <TabTrigger key={name} name={name} href={href} asChild>
            <NavButton Icon={Icon} label={label} />
          </TabTrigger>
        ))}
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Aparece atrás dos cantos arredondados da barra inferior.
    backgroundColor: colors.background,
  },
});
