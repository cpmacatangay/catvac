package com.catvac.app.ui.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.BrightnessAuto
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.DarkMode
import androidx.compose.material.icons.outlined.LightMode
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.catvac.app.R
import com.catvac.app.data.model.DashboardItem
import com.catvac.app.data.model.VaccineStatus
import com.catvac.app.ui.components.CatCard
import com.catvac.app.ui.components.CatCardSkeleton
import com.catvac.app.ui.components.CatVacLogo
import com.catvac.app.ui.theme.ThemeMode
import com.catvac.app.util.urgencyRank
import com.catvac.app.util.worstVaccineStatus

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    navController: NavController,
    viewModel: DashboardViewModel,
    onLogout: () -> Unit,
    themeMode: ThemeMode = ThemeMode.LIGHT,
    onToggleTheme: () -> Unit = {},
) {
    val state by viewModel.uiState.collectAsState()
    val addCatState by viewModel.addCatState.collectAsState()
    val isRefreshing by viewModel.isRefreshing.collectAsState()
    var showAddCat by remember { mutableStateOf(false) }
    var showLogoutConfirm by remember { mutableStateOf(false) }
    val snackbarHostState = remember { SnackbarHostState() }
    val catAddedText = stringResource(R.string.dashboard_cat_added)

    LaunchedEffect(addCatState) {
        when (addCatState) {
            is AddCatState.Success -> {
                showAddCat = false
                snackbarHostState.showSnackbar(catAddedText)
                viewModel.resetAddCatState()
            }
            is AddCatState.Error -> {
                snackbarHostState.showSnackbar((addCatState as AddCatState.Error).message)
                viewModel.resetAddCatState()
            }
            else -> {}
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.app_name), style = MaterialTheme.typography.headlineMedium) },
                actions = {
                    IconButton(onClick = onToggleTheme) {
                        Icon(
                            imageVector = when (themeMode) {
                                ThemeMode.LIGHT -> Icons.Outlined.LightMode
                                ThemeMode.DARK -> Icons.Outlined.DarkMode
                                ThemeMode.SYSTEM -> Icons.Outlined.BrightnessAuto
                            },
                            contentDescription = stringResource(
                                when (themeMode) {
                                    ThemeMode.LIGHT -> R.string.theme_current_light
                                    ThemeMode.DARK -> R.string.theme_current_dark
                                    ThemeMode.SYSTEM -> R.string.theme_current_system
                                }
                            ),
                        )
                    }
                    IconButton(onClick = { showAddCat = true }) {
                        Icon(Icons.Outlined.Add, stringResource(R.string.dashboard_add_cat))
                    }
                    TextButton(onClick = { showLogoutConfirm = true }) {
                        Text(stringResource(R.string.dashboard_logout))
                    }
                },
            )
        },
    ) { padding ->
        PullToRefreshBox(
            isRefreshing = isRefreshing,
            onRefresh = { viewModel.refreshDashboard() },
            modifier = Modifier.fillMaxSize().padding(padding),
        ) {
            when (val s = state) {
                is DashboardUiState.Loading -> {
                    Column(Modifier.fillMaxSize().padding(16.dp)) {
                        LazyVerticalGrid(
                            columns = GridCells.Adaptive(minSize = 320.dp),
                            contentPadding = PaddingValues(16.dp),
                            horizontalArrangement = Arrangement.spacedBy(20.dp),
                            verticalArrangement = Arrangement.spacedBy(20.dp),
                            userScrollEnabled = false,
                        ) {
                            items(6) { CatCardSkeleton() }
                        }
                    }
                }
                is DashboardUiState.Error -> {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp)
                            .verticalScroll(rememberScrollState()),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Text(s.message, style = MaterialTheme.typography.bodyLarge)
                        Spacer(Modifier.height(16.dp))
                        Button(onClick = { viewModel.loadDashboard() }) {
                            Text(stringResource(R.string.dashboard_retry))
                        }
                    }
                }
                is DashboardUiState.Success -> {
                    if (s.items.isEmpty()) {
                        EmptyDashboard(onAddCat = { showAddCat = true })
                    } else {
                        val sortedItems = remember(s.items) {
                            s.items.sortedByDescending { worstVaccineStatus(it.vaccines).urgencyRank() }
                        }
                        val overdue = s.items.sumOf { item -> item.vaccines.count { it.status == VaccineStatus.OVERDUE } }
                        val due = s.items.sumOf { item -> item.vaccines.count { it.status == VaccineStatus.DUE } }
                        LazyVerticalGrid(
                            columns = GridCells.Adaptive(minSize = 320.dp),
                            contentPadding = PaddingValues(16.dp),
                            horizontalArrangement = Arrangement.spacedBy(20.dp),
                            verticalArrangement = Arrangement.spacedBy(20.dp),
                        ) {
                            item(span = { GridItemSpan(maxLineSpan) }) {
                                DashboardSummary(overdue = overdue, due = due)
                            }
                            items(sortedItems, key = { it.cat.id }) { item ->
                                CatCard(
                                    cat = item.cat,
                                    vaccines = item.vaccines,
                                    onClick = { navController.navigate("cat/${item.cat.id}") },
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    if (showAddCat) {
        AddCatDialog(
            isSubmitting = addCatState is AddCatState.Loading,
            onDismiss = { if (addCatState !is AddCatState.Loading) { showAddCat = false; viewModel.resetAddCatState() } },
            onSubmit = { name, breed, sex, notes ->
                showAddCat = false
                viewModel.addCat(name, breed, sex, notes)
            },
        )
    }

    if (showLogoutConfirm) {
        AlertDialog(
            onDismissRequest = { showLogoutConfirm = false },
            title = { Text(stringResource(R.string.logout_title)) },
            text = { Text(stringResource(R.string.logout_body)) },
            confirmButton = {
                Button(onClick = { showLogoutConfirm = false; onLogout() }) { Text(stringResource(R.string.dashboard_logout)) }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutConfirm = false }) { Text(stringResource(R.string.action_cancel)) }
            },
        )
    }
}

@Composable
private fun DashboardSummary(overdue: Int, due: Int) {
    val urgent = overdue > 0 || due > 0
    val overdueText = stringResource(R.string.dashboard_summary_overdue, overdue)
    val dueText = stringResource(R.string.dashboard_summary_due, due)
    val allClearText = stringResource(R.string.dashboard_summary_all_clear)
    val text = when {
        overdue > 0 && due > 0 -> "$overdueText · $dueText"
        overdue > 0 -> overdueText
        due > 0 -> dueText
        else -> allClearText
    }
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            imageVector = if (urgent) Icons.Outlined.Notifications else Icons.Outlined.CheckCircle,
            contentDescription = null,
            modifier = Modifier.size(18.dp),
            tint = if (overdue > 0) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
        )
        Spacer(Modifier.width(8.dp))
        Text(
            text = text,
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun EmptyDashboard(onAddCat: () -> Unit) {
    Box(
        modifier = Modifier.fillMaxSize().padding(32.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
                modifier = Modifier
                    .size(96.dp)
                    .clip(RoundedCornerShape(24.dp))
                    .background(MaterialTheme.colorScheme.primaryContainer),
                contentAlignment = Alignment.Center,
            ) {
                CatVacLogo(modifier = Modifier.size(56.dp))
            }
            Spacer(Modifier.height(20.dp))
            Text(
                stringResource(R.string.dashboard_empty_title),
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onSurface,
            )
            Spacer(Modifier.height(8.dp))
            Text(
                stringResource(R.string.dashboard_empty_body),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(24.dp))
            Button(onClick = onAddCat) {
                Icon(Icons.Outlined.Add, null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(4.dp))
                Text(stringResource(R.string.dashboard_empty_cta))
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AddCatDialog(
    isSubmitting: Boolean,
    onDismiss: () -> Unit,
    onSubmit: (name: String, breed: String, sex: String, notes: String) -> Unit,
) {
    var name by remember { mutableStateOf("") }
    var breed by remember { mutableStateOf("") }
    var sex by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(stringResource(R.string.add_cat_title), style = MaterialTheme.typography.headlineMedium)
            Spacer(Modifier.height(4.dp))

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text(stringResource(R.string.cat_name_label)) },
                singleLine = true,
                shape = MaterialTheme.shapes.medium,
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = breed,
                onValueChange = { breed = it },
                label = { Text(stringResource(R.string.cat_breed_label)) },
                singleLine = true,
                shape = MaterialTheme.shapes.medium,
                modifier = Modifier.fillMaxWidth(),
            )
            var expanded by remember { mutableStateOf(false) }
            ExposedDropdownMenuBox(
                expanded = expanded,
                onExpandedChange = { expanded = it },
            ) {
                OutlinedTextField(
                    value = when (sex) {
                        "M" -> stringResource(R.string.sex_male)
                        "F" -> stringResource(R.string.sex_female)
                        else -> ""
                    },
                    onValueChange = {},
                    readOnly = true,
                    label = { Text(stringResource(R.string.cat_sex_label)) },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded) },
                    shape = MaterialTheme.shapes.medium,
                    modifier = Modifier.fillMaxWidth().menuAnchor(MenuAnchorType.PrimaryNotEditable),
                )
                ExposedDropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false },
                ) {
                    DropdownMenuItem(text = { Text(stringResource(R.string.sex_not_set)) }, onClick = { sex = ""; expanded = false })
                    DropdownMenuItem(text = { Text(stringResource(R.string.sex_male)) }, onClick = { sex = "M"; expanded = false })
                    DropdownMenuItem(text = { Text(stringResource(R.string.sex_female)) }, onClick = { sex = "F"; expanded = false })
                }
            }
            OutlinedTextField(
                value = notes,
                onValueChange = { notes = it },
                label = { Text(stringResource(R.string.cat_notes_label)) },
                maxLines = 3,
                shape = MaterialTheme.shapes.medium,
                modifier = Modifier.fillMaxWidth(),
            )

            Spacer(Modifier.height(8.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                TextButton(onClick = onDismiss, enabled = !isSubmitting) { Text(stringResource(R.string.action_cancel)) }
                Spacer(Modifier.width(8.dp))
                Button(
                    onClick = { if (name.isNotBlank()) onSubmit(name, breed, sex, notes) },
                    enabled = name.isNotBlank() && !isSubmitting,
                ) {
                    if (isSubmitting) {
                        CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                    } else {
                        Text(stringResource(R.string.action_add))
                    }
                }
            }
            Spacer(Modifier.height(16.dp))
        }
    }
}
